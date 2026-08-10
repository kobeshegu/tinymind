import { describe, expect, it } from "vitest";
import { decodeRouteSegment, stripFrontmatter } from "./content";

describe("stripFrontmatter", () => {
  it("supports LF and CRLF frontmatter", () => {
    expect(stripFrontmatter("---\ntitle: test\n---\nBody %20 stays encoded"))
      .toBe("Body %20 stays encoded");
    expect(stripFrontmatter("---\r\ntitle: test\r\n---\r\nBody"))
      .toBe("Body");
  });

  it("does not remove a horizontal rule in the body", () => {
    expect(stripFrontmatter("Intro\n---\nBody")).toBe("Intro\n---\nBody");
  });
});

describe("decodeRouteSegment", () => {
  it("decodes exactly once", () => {
    expect(decodeRouteSegment("post%2C-title")).toBe("post,-title");
    expect(decodeRouteSegment("literal%2520value")).toBe("literal%20value");
  });

  it("preserves malformed route input", () => {
    expect(decodeRouteSegment("bad%2")).toBe("bad%2");
  });
});
