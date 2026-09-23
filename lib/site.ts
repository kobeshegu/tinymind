export const SITE_OWNER =
  process.env.NEXT_PUBLIC_SITE_OWNER?.trim() || "kobeshegu";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
  "https://forevermamba.work";

export const SITE_NAME = "Mengping Yang";

export function getCreateType(
  pathname: string,
  sessionUsername?: string
): "blog" | "thought" | null {
  if (!sessionUsername) return null;

  const username = sessionUsername.toLowerCase();
  const owner = SITE_OWNER.toLowerCase();

  if (username === owner) {
    if (pathname === "/blog") return "blog";
    if (pathname === "/thoughts") return "thought";
  }

  const profileRoute = pathname.match(
    /^\/([a-zA-Z0-9-]+)(?:\/(blog|thoughts))?\/?$/
  );
  if (!profileRoute || profileRoute[1].toLowerCase() !== username) {
    return null;
  }

  return profileRoute[2] === "thoughts" ? "thought" : "blog";
}
