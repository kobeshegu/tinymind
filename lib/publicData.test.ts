import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assertPublicProfile } from "./publicData";

describe("assertPublicProfile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects malformed names without a network request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(assertPublicProfile("invalid_user")).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a missing repository marker to a 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));
    await expect(assertPublicProfile("missing-profile-test")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deduplicates concurrent checks and normalizes the owner", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await expect(
      Promise.all([
        assertPublicProfile("Concurrent-Profile-Test"),
        assertPublicProfile("concurrent-profile-test"),
        assertPublicProfile("CONCURRENT-PROFILE-TEST"),
      ])
    ).resolves.toEqual([
      "concurrent-profile-test",
      "concurrent-profile-test",
      "concurrent-profile-test",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
