import { describe, expect, it } from "vitest";
import { createErrorResponse, ErrorCodes } from "./apiErrors";

describe("createErrorResponse", () => {
  it("distinguishes missing write permission from rate limiting", async () => {
    const response = createErrorResponse({
      status: 403,
      message: "Resource not accessible by integration",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: ErrorCodes.FORBIDDEN,
      error: expect.stringContaining("write access"),
    });
  });

  it("explains GitHub validation failures", async () => {
    const response = createErrorResponse({
      status: 422,
      message: "Invalid request",
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: ErrorCodes.VALIDATION_ERROR,
      error: expect.stringContaining("same title"),
    });
  });
});
