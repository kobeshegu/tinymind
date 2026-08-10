import assert from "node:assert/strict";
import test from "node:test";

import {
  CliError,
  GitHubApiError,
  decodeGitHubContent,
  parseArgs,
  publishArticle,
  publishThought,
  serializeArticle,
  slugify,
  validateRepository,
} from "./tinymind.mjs";

function githubFile(value, sha = "old-sha") {
  return {
    type: "file",
    sha,
    content: Buffer.from(value).toString("base64"),
  };
}

test("parses zero-friction thoughts and explicit articles", () => {
  assert.deepEqual(parseArgs(["hello", "world"]), {
    positional: ["hello", "world"],
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
    mode: "thought",
  });
  assert.equal(parseArgs(["-t", "你好", "-c", "正文"]).mode, "article");
});

test("rejects ambiguous content sources and unsafe repositories", () => {
  assert.throws(() => parseArgs(["text", "-c", "other"]), CliError);
  assert.throws(() => validateRepository("owner/repo/extra"), CliError);
  assert.equal(validateRepository("owner/tinymind-blog"), "owner/tinymind-blog");
});

test("generates multilingual slugs and a safe fallback", () => {
  assert.equal(slugify("你好，TinyMind!"), "你好-tinymind");
  assert.equal(slugify("✨", 1234), "post-1234");
});

test("serializes one safe frontmatter block", () => {
  const date = new Date("2026-08-10T01:02:03.000Z");
  assert.equal(
    serializeArticle("C++: good\" title", "---\ntitle: old\ndate: old\n---\n\n# Body\n", date),
    "---\ntitle: \"C++: good\\\" title\"\ndate: 2026-08-10T01:02:03.000Z\n---\n\n# Body\n",
  );
});

test("prepends thoughts using content and SHA from the same API response", () => {
  const writes = [];
  const client = {
    getFile() {
      return githubFile('[{"id":"1","content":"old","timestamp":"2026-01-01T00:00:00.000Z"}]');
    },
    putFile(...args) {
      writes.push(args);
      return { commit: { sha: "new-commit" } };
    },
  };

  const result = publishThought(client, "owner/repo", "new", {
    date: new Date("2026-08-10T01:02:03.004Z"),
  });
  const written = JSON.parse(writes[0][2]);
  assert.equal(writes[0][4], "old-sha");
  assert.equal(written[0].id, "1786323723004");
  assert.equal(written[1].content, "old");
  assert.equal(result.commit, "new-commit");
});

test("retries thought conflicts with a fresh read", () => {
  let reads = 0;
  let writes = 0;
  const client = {
    getFile() {
      reads += 1;
      return githubFile("[]", `sha-${reads}`);
    },
    putFile() {
      writes += 1;
      if (writes === 1) {
        throw new GitHubApiError("conflict", 409);
      }
      return { commit: { sha: "ok" } };
    },
  };

  assert.equal(publishThought(client, "owner/repo", "hello").commit, "ok");
  assert.equal(reads, 2);
});

test("creates articles without overwriting a matching slug", () => {
  const writes = [];
  const emptyClient = {
    getFile() {
      return null;
    },
    putFile(...args) {
      writes.push(args);
      return { commit: { sha: "article-commit" } };
    },
  };
  const date = new Date("2026-08-10T01:02:03.000Z");
  const result = publishArticle(emptyClient, "owner/repo", "你好", "正文", { date });
  assert.equal(result.slug, "你好");
  assert.equal(writes[0][1], "content/blog/你好.md");
  assert.equal(writes[0][4], undefined);

  const existingClient = {
    getFile() {
      return githubFile("old");
    },
    putFile() {
      throw new Error("must not write");
    },
  };
  assert.throws(() => publishArticle(existingClient, "owner/repo", "你好", "正文", { date }), /already exists/);
});

test("decodes line-wrapped GitHub content", () => {
  const encoded = Buffer.from("hello").toString("base64");
  assert.equal(decodeGitHubContent({ type: "file", content: `${encoded.slice(0, 4)}\n${encoded.slice(4)}` }), "hello");
});
