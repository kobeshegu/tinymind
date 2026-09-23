import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIconUrlsForUsername } from "@/lib/githubApi";
import { usernameSchema } from "@/lib/validation";
import { assertPublicProfile, isPublicProfileNotFound } from "@/lib/publicData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  if (!usernameSchema.safeParse(username).success) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }
  try {
    await assertPublicProfile(username);
  } catch (error) {
    if (isPublicProfileNotFound(error)) {
      return { title: "Not Found", robots: { index: false, follow: false } };
    }
    throw error;
  }
  const { iconPath } = await getIconUrlsForUsername(username);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://forevermamba.work";
  const canonicalUrl = `${baseUrl}/${username}`;

  return {
    title: `${username}'s TinyMind Blog`,
    description: `Explore ${username}'s blog posts and thoughts on TinyMind. Write and sync content with GitHub.`,
    manifest: `/api/manifest/${username}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${username}'s TinyMind Blog`,
      description: `Explore ${username}'s blog posts and thoughts on TinyMind.`,
      url: canonicalUrl,
      siteName: "TinyMind",
      type: "profile",
      images: [
        {
          url: iconPath,
          width: 512,
          height: 512,
          alt: `${username}'s profile`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${username}'s TinyMind Blog`,
      description: `Explore ${username}'s blog posts and thoughts on TinyMind.`,
      images: [iconPath],
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
    icons: [
      {
        url: iconPath,
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Rejecting the malformed ones here covers every /[username]/* page at once.
  // Without it, any string reached GitHub — so an anonymous loop over random
  // names both burned the shared token's rate limit and minted unbounded
  // indexable pages with attacker-chosen titles.
  if (!usernameSchema.safeParse(username).success) {
    notFound();
  }

  return children;
}
