"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import ChromeIcon from "@/components/icons/ChromeIcon";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const t = useTranslations("HomePage");
  const publicUsername = useMemo(
    () => propUsername ?? publicUsernameFromPath(pathname),
    [pathname, propUsername]
  );

  // The login arrives with the session, so this resolves on first render
  // rather than after a round-trip to /api/github.
  const avatarUrl = useMemo(() => {
    const owner = publicUsername ?? session?.user?.username;
    return owner ? `https://github.com/${owner}.png` : "/icon.jpg";
  }, [publicUsername, session?.user?.username]);

  const isLoggedIn = !!session?.user && status === "authenticated";
  const isOnPublicProfilePage = !!publicUsername;

  // Memoize active tab calculation
  const activeTab = useMemo(() => {
    if (isOnPublicProfilePage) {
      if (pathname === `/${publicUsername}/thoughts`) return "thoughts";
      if (pathname === `/${publicUsername}/about`) return "about";
      if (
        pathname === `/${publicUsername}` ||
        pathname.startsWith(`/${publicUsername}/blog`)
      )
        return "blog";
      return "blog";
    } else {
      if (pathname === "/blog" || pathname.startsWith("/blog/")) return "blog";
      if (pathname === "/about") return "about";
      if (pathname === "/" || pathname === "/thoughts") return "thoughts";
      return "thoughts";
    }
  }, [isOnPublicProfilePage, pathname, publicUsername]);

  // Memoize navigation URLs
  const navUrls = useMemo(() => {
    if (isOnPublicProfilePage) {
      return {
        blog: `/${publicUsername}/blog`,
        thoughts: `/${publicUsername}/thoughts`,
        about: `/${publicUsername}/about`,
      };
    } else {
      return {
        blog: "/blog",
        thoughts: "/thoughts",
        about: "/about",
      };
    }
  }, [isOnPublicProfilePage, publicUsername]);

  const shouldShowTabs = isLoggedIn || isOnPublicProfilePage;

  return (
    <header className="fixed top-0 left-0 right-0 py-4 bg-card border-b border-gray-100 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href={isOnPublicProfilePage ? `/${publicUsername}` : "/"}
            className=""
          >
            <Image
              src={avatarUrl}
              alt="Home"
              width={32}
              height={32}
              className="rounded-full"
              unoptimized={avatarUrl.startsWith("https://github.com/")}
            />
          </Link>
          {shouldShowTabs && (
            <div className="flex-grow flex justify-center">
              <div className="flex space-x-2 sm:space-x-4 w-full justify-center">
                <Button
                  asChild
                  variant="ghost"
                  className={`text-lg font-normal border-0 transition-colors duration-150 ${
                    activeTab === "blog" ? "text-black" : "text-gray-300"
                  }`}
                >
                  <Link href={navUrls.blog}>{t("blog")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className={`text-lg font-normal border-0 transition-colors duration-150 ${
                    activeTab === "thoughts" ? "text-black" : "text-gray-300"
                  }`}
                >
                  <Link href={navUrls.thoughts}>{t("thoughts")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className={`text-lg font-normal border-0 transition-colors duration-150 ${
                    activeTab === "about" ? "text-black" : "text-gray-300"
                  }`}
                >
                  <Link href={navUrls.about}>
                    {t("about")}
                  </Link>
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Link
              href="https://chromewebstore.google.com/detail/tinymind-quick-thoughts/gpfojneflmaoemniapdcgikfehpiocag"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black transition-colors"
              title="Get Chrome Extension"
            >
              <ChromeIcon size={22} />
            </Link>
            <Link
              href="https://github.com/mazzzystar/tinymind"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-500"
              aria-label="TinyMind on GitHub"
              title="TinyMind on GitHub"
            >
              <FaGithub size={24} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
