"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Footer = () => {
  const { data: session } = useSession();
  const t = useTranslations("HomePage");
  const userLogin = session?.user?.username;

  if (!session || !session.user?.name || !userLogin) {
    return null;
  }

  const owner = userLogin;
  const repo = "tinymind-blog";

  return (
    <footer className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white py-3 text-center text-sm">
      <div className="container mx-auto px-4 text-gray-400">
        <Link
          href={`/${owner}`}
          className="hover:text-black transition-colors duration-200 mr-4"
        >
          {t("myHomepage")}
        </Link>
        |
        <Link
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black transition-colors duration-200 ml-4"
        >
          {t("dataStoredOnGithub")}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
