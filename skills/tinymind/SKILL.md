---
name: tinymind
description: Publish thoughts and Markdown articles to TinyMind through the user's GitHub-backed tinymind-blog repository. Use when the user asks to post, write, publish, or sync a TinyMind thought or article, or asks to use the tinymind or tm command-line interface.
---

# TinyMind

Publish with the bundled CLI. It writes through the authenticated GitHub CLI and commits directly to the target `tinymind-blog` repository.

## Before publishing

1. Require an explicit user request to publish because every successful command creates a GitHub commit immediately.
2. Run `gh auth status` if authentication is uncertain.
3. Use the repository from `--repo owner/repo` or `TINYMIND_REPO`. Otherwise, let the CLI select `<authenticated-user>/tinymind-blog`.
4. Keep tokens out of commands and files; the CLI reuses `gh` authentication.

## Publish a thought

Pass the thought as positional text:

```bash
tm "今天天气真好"
tinymind "A short thought with **Markdown**."
```

Add an image with `--image`:

```bash
tm --image /path/to/photo.webp "A thought with an image"
```

## Publish an article

Provide both a title and content:

```bash
tm -t "你好" -c "文章正文"
tinymind --title "Long post" --file /path/to/post.md
```

The CLI generates safe YAML frontmatter and preserves Markdown, GFM, and math syntax in the body. It refuses to overwrite an existing slug unless the user explicitly supplies `--force`.

## Run without installation

If `tm` is unavailable, run the bundled script from this skill directory:

```bash
node scripts/tinymind.mjs "Your thought"
node scripts/tinymind.mjs -t "Title" -f /path/to/post.md
```

Use `--dry-run` to validate and preview without contacting GitHub. Use `--json` when machine-readable output is useful.

## Install the local commands

From this skill directory, run:

```bash
npm install --global .
```

This installs both `tinymind` and its short alias `tm`.
