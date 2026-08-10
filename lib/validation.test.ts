import { describe, expect, it } from "vitest";
import { blogIdSchema } from "./validation";

describe("blogIdSchema", () => {
  it("preserves literal percent-encoded text instead of decoding twice", () => {
    expect(blogIdSchema.parse("literal%20value")).toBe("literal%20value");
  });

  it.each(["..", "../post", "folder/post", String.raw`folder\post`, "%2e%2e", "%2Fetc", "%5cetc"])(
    "rejects unsafe path %j",
    (id) => {
      expect(blogIdSchema.safeParse(id).success).toBe(false);
    }
  );
});
