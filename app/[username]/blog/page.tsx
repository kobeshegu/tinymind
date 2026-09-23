import { Metadata } from "next";
import PublicBlogList from "@/components/PublicBlogList";
import { getPublicBlogPosts, isPublicProfileNotFound } from "@/lib/publicData";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://forevermamba.work";
  const canonicalUrl = `${baseUrl}/${username}/blog`;

  return {
    title: `${username}'s Blog Posts - TinyMind`,
    description: `Read all blog posts by ${username} on TinyMind. Discover insights, tutorials, and thoughts shared through GitHub-synced content.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${username}'s Blog Posts`,
      description: `Read all blog posts by ${username} on TinyMind.`,
      url: canonicalUrl,
      siteName: "TinyMind",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${username}'s Blog Posts`,
      description: `Read all blog posts by ${username} on TinyMind.`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Increase cache duration and add error boundary
export const revalidate = 300; // 5 minutes instead of 60 seconds

export default async function PublicBlogListPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let blogPosts;
  try {
    blogPosts = await getPublicBlogPosts(username);
  } catch (error: unknown) {
    if (isPublicProfileNotFound(error)) notFound();
    console.error("Error fetching public data:", error);
    throw error;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <PublicBlogList posts={blogPosts} username={username} />
      </div>
    </div>
  );
}
