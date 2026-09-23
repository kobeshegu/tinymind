import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import EditorComponent from "@/components/Editor";
import GitHubSignInButton from "@/components/GitHubSignInButton";
import { notFound } from "next/navigation";
import { SITE_OWNER } from "@/lib/site";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const session = await getServerSession(authOptions);
  const defaultType =
    type === "blog"
      ? "blog"
      : type === "about"
      ? "about"
      : "thought";

  if (!session) {
    return <GitHubSignInButton />;
  }

  if (session.user?.username?.toLowerCase() !== SITE_OWNER.toLowerCase()) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <EditorComponent defaultType={defaultType} />
    </div>
  );
}
