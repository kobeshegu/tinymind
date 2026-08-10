import { describe, expect, it, vi } from "vitest";

const { getUserLogin } = vi.hoisted(() => ({
  getUserLogin: vi.fn().mockResolvedValue("restored-user"),
}));
vi.mock("./githubApi", () => ({ getUserLogin }));

import { authOptions } from "./auth";

describe("NextAuth JWT compatibility", () => {
  it("restores the username in an existing JWT once", async () => {
    const jwt = authOptions.callbacks?.jwt;
    expect(jwt).toBeTypeOf("function");

    const token = await jwt!({
      token: { accessToken: "existing-token" },
      account: null,
      profile: undefined,
      user: undefined,
      trigger: undefined,
      isNewUser: false,
      session: undefined,
    } as never);

    expect(token.username).toBe("restored-user");
    expect(getUserLogin).toHaveBeenCalledTimes(1);
  });
});
