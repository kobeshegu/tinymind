import type { MetadataRoute } from "next";
import { getPublicBlogPosts } from "@/lib/publicData";
import { SITE_OWNER, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/thoughts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const posts = await getPublicBlogPosts(SITE_OWNER);
    pages.push(
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/${encodeURIComponent(post.id)}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error("Sitemap: unable to load blog posts", error);
  }

  return pages;
}
