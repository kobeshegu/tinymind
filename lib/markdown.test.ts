import { describe, expect, it } from "vitest";
import { containsMath } from "./markdown";

describe("containsMath", () => {
  it.each([
    "$x$",
    "$ x $",
    "$$x + y$$",
    "$x +\ny$",
    "price $25",
  ])("loads math support for %j", (content) => {
    expect(containsMath(content)).toBe(true);
  });

  it.each(["plain markdown", "escaped \\$ value", String.raw`escaped \\\$ value`])(
    "does not load math support for %j",
    (content) => {
      expect(containsMath(content)).toBe(false);
    }
  );

  it("recognizes a dollar preceded by an even number of backslashes", () => {
    expect(containsMath(String.raw`math \\$x$`)).toBe(true);
  });
});
