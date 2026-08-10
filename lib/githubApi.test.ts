import { describe, expect, it, vi } from "vitest";
import { getBlogPostsPublicFast } from "./githubApi";

function octokitWith(
  graphql: ReturnType<typeof vi.fn>,
  getContent: ReturnType<typeof vi.fn>
) {
  return { graphql, repos: { getContent } } as never;
}

describe("getBlogPostsPublicFast reliability", () => {
  it("turns a missing GraphQL repository into a public 404 without REST amplification", async () => {
    const error = Object.assign(new Error("missing"), {
      errors: [{ type: "NOT_FOUND", path: ["repository"] }],
    });
    const graphql = vi.fn().mockRejectedValue(error);
    const getContent = vi.fn();

    await expect(
      getBlogPostsPublicFast(octokitWith(graphql, getContent), "missing-owner-a", "tinymind-blog")
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(getContent).not.toHaveBeenCalled();
  });

  it("does not convert GraphQL and REST failures into a cached empty blog", async () => {
    const graphql = vi.fn().mockRejectedValue(Object.assign(new Error("upstream"), { status: 500 }));
    const getContent = vi.fn().mockRejectedValue(Object.assign(new Error("upstream"), { status: 500 }));

    await expect(
      getBlogPostsPublicFast(octokitWith(graphql, getContent), "failing-owner-b", "tinymind-blog")
    ).rejects.toMatchObject({ status: 500 });
  });

  it("fails the whole read when a truncated post cannot be fetched", async () => {
    const graphql = vi.fn().mockResolvedValue({
      repository: {
        object: {
          entries: [
            {
              name: "large.md",
              type: "blob",
              object: { text: "partial", isTruncated: true },
            },
          ],
        },
      },
    });
    const getContent = vi.fn().mockRejectedValue(Object.assign(new Error("upstream"), { status: 500 }));

    await expect(
      getBlogPostsPublicFast(octokitWith(graphql, getContent), "truncated-owner-c", "tinymind-blog")
    ).rejects.toMatchObject({ status: 500 });
  });
});
