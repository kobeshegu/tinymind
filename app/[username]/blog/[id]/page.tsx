import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBlogPostContent } from "@/components/PublicBlogPostContent";
import { getPublicBlogPosts, isPublicProfileNotFound } from "@/lib/publicData";
import { decodeRouteSegment, stripFrontmatter } from "@/lib/content";

export default async function PublicBlogPost({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  const posts = await getPublicBlogPosts(username);
  const post = posts.find((p) => p.id === decodeRouteSegment(id));

  if (!post) {
    notFound();
  }

  return (
    <PublicBlogPostContent
      title={post.title}
      date={post.date}
      content={stripFrontmatter(post.content)}
      backHref={`/${username}/blog`}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}): Promise<Metadata> {
  const { username, id } = await params;

  try {
    const posts = await getPublicBlogPosts(username);
    const post = posts.find((p) => p.id === decodeRouteSegment(id));

    if (!post) {
      return {
        title: "Blog Post Not Found",
        robots: { index: false, follow: false },
      };
    }

    const contentWithoutFrontmatter = stripFrontmatter(post.content);

    const description =
      contentWithoutFrontmatter
        .split(". ")
        .slice(0, 3)
        .join(". ")
        .slice(0, 200) + "...";

    // Find the first image in the content
    const imageMatch = contentWithoutFrontmatter.match(/!\[.*?\]\((.*?)\)/);
    let imageUrl = imageMatch ? imageMatch[1] : "/icon.jpg";

    // If the image URL is relative, make it absolute
    if (imageUrl.startsWith("/")) {
      imageUrl = `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://forevermamba.work"
      }${imageUrl}`;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://forevermamba.work";

    return {
      title: post.title,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
        publishedTime: post.date,
        authors: [username],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [imageUrl],
        creator: `@${username}`,
      },
      alternates: {
        canonical: `${baseUrl}/${username}/blog/${id}`,
      },
    };
  } catch (error) {
    if (isPublicProfileNotFound(error)) {
      return {
        title: "Blog Post Not Found",
        robots: { index: false, follow: false },
      };
    }
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post Temporarily Unavailable",
      robots: { index: false, follow: false },
    };
  }
}
