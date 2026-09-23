import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBlogPostContent } from "@/components/PublicBlogPostContent";
import { decodeRouteSegment, stripFrontmatter } from "@/lib/content";
import { getPublicBlogPosts } from "@/lib/publicData";
import { SITE_NAME, SITE_OWNER, SITE_URL } from "@/lib/site";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posts = await getPublicBlogPosts(SITE_OWNER);
  const post = posts.find((item) => item.id === decodeRouteSegment(id));

  if (!post) notFound();

  return (
    <PublicBlogPostContent
      title={post.title}
      date={post.date}
      content={stripFrontmatter(post.content)}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const posts = await getPublicBlogPosts(SITE_OWNER);
  const post = posts.find((item) => item.id === decodeRouteSegment(id));

  if (!post) {
    return { title: "Essay not found", robots: { index: false } };
  }

  const plainText = stripFrontmatter(post.content)
    .replace(/[#*_>`\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: plainText.slice(0, 180),
    alternates: {
      canonical: `${SITE_URL}/blog/${encodeURIComponent(post.id)}`,
    },
    openGraph: {
      title: post.title,
      description: plainText.slice(0, 180),
      type: "article",
      publishedTime: post.date,
      authors: [SITE_NAME],
    },
  };
}
