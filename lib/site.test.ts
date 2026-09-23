import { describe, expect, it } from "vitest";
import { getCreateType } from "./site";

describe("getCreateType", () => {
  it("shows owner controls on the custom-domain routes", () => {
    expect(getCreateType("/blog", "kobeshegu")).toBe("blog");
    expect(getCreateType("/thoughts", "kobeshegu")).toBe("thought");
  });

  it("shows controls on the signed-in user's public profile", () => {
    expect(getCreateType("/kobeshegu", "kobeshegu")).toBe("blog");
    expect(getCreateType("/kobeshegu/blog", "kobeshegu")).toBe("blog");
    expect(getCreateType("/kobeshegu/thoughts", "kobeshegu")).toBe("thought");
  });

  it("does not expose controls on another user's profile", () => {
    expect(getCreateType("/another-user/thoughts", "kobeshegu")).toBeNull();
    expect(getCreateType("/blog", "another-user")).toBeNull();
    expect(getCreateType("/kobeshegu/blog/post", "kobeshegu")).toBeNull();
  });
});
