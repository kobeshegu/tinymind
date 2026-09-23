"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Github, Home, LogIn, PenLine } from "lucide-react";
import { SITE_NAME, SITE_OWNER } from "@/lib/site";

const APP_ROUTES = new Set([
  "_next",
  "api",
  "about",
  "blog",
  "editor",
  "login",
  "thoughts",
  "unavailable",
]);

function publicUsernameFromPath(pathname: string): string | undefined {
  const firstSegment = pathname.split("/")[1];
  if (!firstSegment || APP_ROUTES.has(firstSegment)) return undefined;
  return /^(?!-)[a-zA-Z0-9-]{1,39}(?<!-)$/.test(firstSegment)
    ? firstSegment
    : undefined;
}

export default function Header({
  username: propUsername,
}: {
  username?: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const publicUsername =
    propUsername ?? publicUsernameFromPath(pathname);
  const profileBase = publicUsername ? `/${publicUsername}` : "";
  const isOwner =
    session?.user?.username?.toLowerCase() === SITE_OWNER.toLowerCase();

  const links = [
    { label: "Blog", href: `${profileBase}/blog`, active: "blog" },
    {
      label: "Thoughts",
      href: `${profileBase}/thoughts`,
      active: "thoughts",
    },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label={`${SITE_NAME} home`}>
          <span className="site-mark" aria-hidden="true">
            MY
          </span>
          <span>{SITE_NAME}</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {links.map((link) => {
            const isActive =
              link.active === "blog"
                ? pathname === link.href || pathname.startsWith(`${link.href}/`)
                : pathname === link.href;

            return (
              <Link
                key={link.active}
                href={link.href}
                className={isActive ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-actions">
          <Link href="/" className="icon-link" aria-label="Home" title="Home">
            <Home aria-hidden="true" />
          </Link>
          {isOwner && (
            <Link
              href="/editor?type=blog"
              className="icon-link"
              aria-label="Write"
              title="Write"
            >
              <PenLine aria-hidden="true" />
            </Link>
          )}
          {!session?.user && (
            <Link
              href="/login"
              className="icon-link"
              aria-label="Owner sign in"
              title="Owner sign in"
            >
              <LogIn aria-hidden="true" />
            </Link>
          )}
          <Link
            href={`https://github.com/${SITE_OWNER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
            aria-label={`${SITE_NAME} on GitHub`}
            title="GitHub"
          >
            <Github aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
