/** Remove only a leading YAML frontmatter block, accepting LF and CRLF files. */
export function stripFrontmatter(content: string): string {
  return content.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
}

/** Decode exactly one URL-encoded route segment, preserving malformed input. */
export function decodeRouteSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
