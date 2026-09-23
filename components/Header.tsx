"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FilePlus2,
  Github,
  Home,
  LogIn,
  MessageSquarePlus,
} from "lucide-react";
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
  const { data: session, status } = useSession();
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
          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="header-sign-in"
            >
              <LogIn aria-hidden="true" />
              <span>Owner sign in</span>
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
      <div className="owner-toolbar">
        <div className="owner-toolbar-inner">
          <span className="owner-toolbar-note">
            <Github aria-hidden="true" />
            {isOwner
              ? "Editor submissions sync directly to GitHub"
              : "Author tools require the owner GitHub account"}
          </span>
          <Link href="/editor?type=blog" className="owner-command">
            <FilePlus2 aria-hidden="true" />
            New Blog
          </Link>
          <Link href="/editor?type=thought" className="owner-command">
            <MessageSquarePlus aria-hidden="true" />
            New Thought
          </Link>
        </div>
      </div>
    </header>
  );
}
