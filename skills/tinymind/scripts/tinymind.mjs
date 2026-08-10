#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_REPOSITORY = "tinymind-blog";
const DEFAULT_SITE = "https://tinymind.me";
const MAX_THOUGHT_LENGTH = 50_000;
const MAX_ARTICLE_LENGTH = 100_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
  ".bmp",
  ".heic",
]);

export class CliError extends Error {}

export class GitHubApiError extends CliError {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (value === undefined || value === "") {
    throw new CliError(`${option} requires a value`);
  }
  return value;
}

export function parseArgs(argv) {
  const options = {
    positional: [],
    title: undefined,
    content: undefined,
    file: undefined,
    image: undefined,
    repo: undefined,
    force: false,
    dryRun: false,
    json: false,
    help: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "-t":
      case "--title":
        options.title = takeValue(argv, index, argument);
        index += 1;
        break;
      case "-c":
      case "--content":
        options.content = takeValue(argv, index, argument);
        index += 1;
        break;
      case "-f":
      case "--file":
        options.file = takeValue(argv, index, argument);
        index += 1;
        break;
      case "-i":
      case "--image":
        options.image = takeValue(argv, index, argument);
        index += 1;
        break;
      case "-r":
      case "--repo":
        options.repo = takeValue(argv, index, argument);
        index += 1;
        break;
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-v":
      case "--version":
        options.version = true;
        break;
      case "--":
        options.positional.push(...argv.slice(index + 1));
        index = argv.length;
        break;
      default:
        if (argument.startsWith("-")) {
          throw new CliError(`Unknown option: ${argument}`);
        }
        options.positional.push(argument);
    }
  }

  if (options.help || options.version) {
    return options;
  }

  const sourceCount = [
    options.content !== undefined,
    options.file !== undefined,
    options.positional.length > 0,
  ].filter(Boolean).length;

  if (sourceCount === 0) {
    throw new CliError("Content is required");
  }
  if (sourceCount > 1) {
    throw new CliError("Use only one content source: positional text, --content, or --file");
  }
  if (options.title && options.image) {
    throw new CliError("--image is available for thoughts; embed article images in Markdown");
  }
  if (!options.title && options.force) {
    throw new CliError("--force is only available for articles");
  }

  options.mode = options.title ? "article" : "thought";
  return options;
}

export function readContent(options, readFile = readFileSync) {
  let content;
  if (options.content !== undefined) {
    content = options.content === "-" ? readFile(0, "utf8") : options.content;
  } else if (options.file !== undefined) {
    content = options.file === "-" ? readFile(0, "utf8") : readFile(options.file, "utf8");
  } else {
    content = options.positional.join(" ");
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new CliError("Content cannot be empty");
  }
  return content;
}

export function validateRepository(repository) {
  const normalized = repository?.trim();
  if (!normalized || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(normalized)) {
    throw new CliError("Repository must use the owner/repo format");
  }
  return normalized;
}

export function slugify(title, timestamp = Date.now()) {
  const slug = title
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[\p{P}\p{S}]+/gu, "-")
    .replace(/\s+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const shortened = Array.from(slug).slice(0, 200).join("").replace(/-$/g, "");
  return shortened || `post-${timestamp}`;
}

export function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)*/, "");
}

export function serializeArticle(title, content, date) {
  const body = stripFrontmatter(content).replace(/^(?:\r?\n)+/, "").replace(/(?:\r?\n)+$/, "");
  return `---\ntitle: ${JSON.stringify(title)}\ndate: ${date.toISOString()}\n---\n\n${body}\n`;
}

export function validateThoughtContent(content) {
  if (content.length > MAX_THOUGHT_LENGTH) {
    throw new CliError(`Thoughts cannot exceed ${MAX_THOUGHT_LENGTH.toLocaleString()} characters`);
  }
}

export function validateArticleContent(title, content) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle || normalizedTitle.length > 200 || /[\r\n]/.test(normalizedTitle)) {
    throw new CliError("Article titles must be 1-200 characters on one line");
  }
  if (content.length > MAX_ARTICLE_LENGTH) {
    throw new CliError(`Articles cannot exceed ${MAX_ARTICLE_LENGTH.toLocaleString()} characters`);
  }
  return normalizedTitle;
}

export function decodeGitHubContent(file) {
  if (!file || file.type !== "file" || typeof file.content !== "string") {
    throw new CliError("GitHub returned an unexpected file response");
  }
  return Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8");
}

function encodedContentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function processError(error) {
  if (error?.code === "ENOENT") {
    return new CliError("GitHub CLI (gh) is required: https://cli.github.com/");
  }

  const stderr = Buffer.isBuffer(error?.stderr)
    ? error.stderr.toString("utf8")
    : String(error?.stderr ?? error?.message ?? error);
  const statusMatch = stderr.match(/HTTP\s+(\d{3})/i);
  return new GitHubApiError(stderr.trim() || "GitHub API request failed", statusMatch ? Number(statusMatch[1]) : undefined);
}

export class GitHubClient {
  request(method, endpoint, body) {
    const args = ["api", "--method", method, endpoint];
    const settings = {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    };

    if (body !== undefined) {
      args.push("--input", "-");
      settings.input = JSON.stringify(body);
    }

    try {
      const output = execFileSync("gh", args, settings);
      return output.trim() ? JSON.parse(output) : {};
    } catch (error) {
      throw processError(error);
    }
  }

  currentUser() {
    const user = this.request("GET", "user");
    if (typeof user.login !== "string" || !user.login) {
      throw new CliError("Could not determine the authenticated GitHub user");
    }
    return user.login;
  }

  getFile(repository, path) {
    try {
      return this.request("GET", `repos/${repository}/contents/${encodedContentPath(path)}`);
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  putFile(repository, path, content, message, sha) {
    const body = {
      message,
      content: Buffer.from(content).toString("base64"),
    };
    if (sha) {
      body.sha = sha;
    }
    return this.request("PUT", `repos/${repository}/contents/${encodedContentPath(path)}`, body);
  }
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function withConflictRetry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      if (!(error instanceof GitHubApiError) || error.status !== 409 || attempt === attempts) {
        throw error;
      }
      sleep(100 * attempt);
    }
  }
  throw lastError;
}

function uploadImage(client, repository, imagePath, date) {
  const extension = extname(imagePath).toLocaleLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) {
    throw new CliError(`Unsupported image extension: ${extension || "none"}`);
  }

  const image = readFileSync(imagePath);
  if (image.byteLength === 0 || image.byteLength > MAX_IMAGE_BYTES) {
    throw new CliError("Image must be between 1 byte and 10 MB");
  }

  const day = date.toISOString().slice(0, 10);
  const filename = `${date.getTime()}-${randomBytes(4).toString("hex")}${extension === ".jpeg" ? ".jpg" : extension}`;
  const path = `assets/images/${day}/${filename}`;
  const result = client.putFile(repository, path, image, `Upload image: ${filename}`);
  const commit = result.commit?.sha;
  if (!commit) {
    throw new CliError("GitHub did not return the image commit SHA");
  }
  return `https://raw.githubusercontent.com/${repository}/${commit}/${encodedContentPath(path)}`;
}

export function publishThought(client, repository, content, options = {}) {
  validateThoughtContent(content);

  const date = options.date ?? new Date();
  const image = options.image ? uploadImage(client, repository, options.image, date) : undefined;
  const thought = {
    id: date.getTime().toString(),
    content,
    timestamp: date.toISOString(),
    ...(image ? { image } : {}),
  };

  const result = withConflictRetry(() => {
    const current = client.getFile(repository, "content/thoughts.json");
    let thoughts = [];
    if (current) {
      try {
        thoughts = JSON.parse(decodeGitHubContent(current));
      } catch (error) {
        if (error instanceof CliError) {
          throw error;
        }
        throw new CliError("content/thoughts.json contains invalid JSON");
      }
      if (!Array.isArray(thoughts)) {
        throw new CliError("content/thoughts.json must contain a JSON array");
      }
    }

    return client.putFile(
      repository,
      "content/thoughts.json",
      `${JSON.stringify([thought, ...thoughts], null, 2)}\n`,
      "Add thought via TinyMind CLI",
      current?.sha,
    );
  });

  return { thought, commit: result.commit?.sha };
}

export function publishArticle(client, repository, title, content, options = {}) {
  const normalizedTitle = validateArticleContent(title, content);

  const date = options.date ?? new Date();
  const slug = slugify(normalizedTitle, date.getTime());
  const path = `content/blog/${slug}.md`;
  const serialized = serializeArticle(normalizedTitle, content, date);

  const result = withConflictRetry(() => {
    const current = client.getFile(repository, path);
    if (current && !options.force) {
      throw new CliError(`Article already exists: ${slug}. Use --force to replace it.`);
    }
    return client.putFile(
      repository,
      path,
      serialized,
      `${current ? "Update" : "Add"} blog post: ${normalizedTitle}`,
      current?.sha,
    );
  });

  return { slug, content: serialized, commit: result.commit?.sha };
}

export function helpText(command = "tm") {
  return `TinyMind CLI

Usage:
  ${command} <thought text...>
  ${command} -t <title> -c <article content>
  ${command} -t <title> -f <markdown file>

Options:
  -t, --title <title>     Publish an article instead of a thought
  -c, --content <text>    Read content from an argument; use - for stdin
  -f, --file <path>       Read content from a UTF-8 Markdown file
  -i, --image <path>      Attach an image to a thought
  -r, --repo <owner/repo> Override TINYMIND_REPO
      --force             Replace an article with the same slug
      --dry-run           Validate and preview without writing to GitHub
      --json              Print machine-readable output
  -h, --help              Show this help
  -v, --version           Show the version

Examples:
  tm 今天天气真好
  tm -t 你好 -c 文章正文
  tm -t "A longer post" -f post.md`;
}

function printResult(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  process.stdout.write(`${result.message}\n${result.url}\n`);
}

export function main(argv = process.argv.slice(2), environment = process.env) {
  const options = parseArgs(argv);
  const command = process.argv[1]?.endsWith("tinymind") ? "tinymind" : "tm";
  if (options.help) {
    process.stdout.write(`${helpText(command)}\n`);
    return;
  }
  if (options.version) {
    process.stdout.write("tinymind-cli 0.1.0\n");
    return;
  }

  const content = readContent(options);
  if (options.dryRun) {
    const date = new Date();
    let preview;
    if (options.mode === "article") {
      const title = validateArticleContent(options.title, content);
      preview = { type: "article", slug: slugify(title, date.getTime()), content: serializeArticle(title, content, date) };
    } else {
      validateThoughtContent(content);
      preview = { type: "thought", content, image: options.image };
    }
    process.stdout.write(`${JSON.stringify(preview, null, options.json ? 0 : 2)}\n`);
    return;
  }

  const client = new GitHubClient();
  const repository = validateRepository(options.repo ?? environment.TINYMIND_REPO ?? `${client.currentUser()}/${DEFAULT_REPOSITORY}`);
  const [owner] = repository.split("/");
  const site = (environment.TINYMIND_URL ?? DEFAULT_SITE).replace(/\/$/, "");

  if (options.mode === "article") {
    const article = publishArticle(client, repository, options.title, content, { force: options.force });
    printResult({
      type: "article",
      id: article.slug,
      repository,
      commit: article.commit,
      url: `${site}/${owner}/blog/${encodeURIComponent(article.slug)}`,
      message: `Article published: ${options.title.trim()}`,
    }, options.json);
    return;
  }

  const published = publishThought(client, repository, content, { image: options.image });
  printResult({
    type: "thought",
    id: published.thought.id,
    repository,
    commit: published.commit,
    url: `${site}/${owner}/thoughts`,
    message: "Thought published",
  }, options.json);
}

function isDirectExecution() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

const isEntryPoint = isDirectExecution();
if (isEntryPoint) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`tinymind: ${message}\n`);
    process.exitCode = 1;
  }
}
