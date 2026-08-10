import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicAboutPage, isPublicProfileNotFound } from "@/lib/publicData";
import { notFound } from "next/navigation";
import { ServerMarkdownRenderer } from "@/components/shared/ServerMarkdownRenderer";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tinymind.me";
  const canonicalUrl = `${baseUrl}/${username}/about`;

  return {
    title: `About ${username} - TinyMind`,
    description: `Learn more about ${username}. Personal information and background shared on TinyMind.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `About ${username}`,
      description: `Learn more about ${username} on TinyMind.`,
      url: canonicalUrl,
      siteName: "TinyMind",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `About ${username}`,
      description: `Learn more about ${username} on TinyMind.`,
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

export default async function PublicAboutPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let aboutPage;
  try {
    aboutPage = await getPublicAboutPage(username);
  } catch (error) {
    if (isPublicProfileNotFound(error)) notFound();
    console.error("Error fetching public about page:", error);
    throw error;
  }

  if (!aboutPage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>About {username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              {username} hasn&apos;t written an about page yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>About {username}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <ServerMarkdownRenderer content={aboutPage.content} />
        </CardContent>
      </Card>
    </div>
  );
}
