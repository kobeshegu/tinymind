"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { AbstractIntlMessages } from "next-intl";
import { useSession } from "next-auth/react";
import { getCreateType } from "@/lib/site";

export default function CreateButton({
  messages,
}: {
  messages: AbstractIntlMessages;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const createType = getCreateType(pathname, session?.user?.username);
  const isThoughtsPage = createType === "thought";
  const createLink = `/editor?type=${createType}`;

  if (status !== "authenticated" || !createType) {
    return null;
  }

  const homeMessages = messages.HomePage as AbstractIntlMessages | undefined;
  const label = isThoughtsPage
    ? String(homeMessages?.createThought ?? "Create a thought")
    : String(homeMessages?.createBlogPost ?? "Create a blog post");

  return (
    <Link
      href={createLink}
      aria-label={label}
      title={label}
      className="fixed bottom-6 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#172126] bg-[#172126] text-white shadow-[0_12px_30px_rgba(23,33,38,0.22)] transition-transform duration-200 hover:-translate-y-1 hover:bg-[#25343b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a6a6] focus-visible:ring-offset-2 sm:bottom-8 sm:right-8"
    >
      <FiPlus className="h-6 w-6" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
