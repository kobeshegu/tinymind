import PublicBlogList from "@/components/PublicBlogList";
import { getPublicBlogPosts, isPublicProfileNotFound } from "@/lib/publicData";
import { notFound } from "next/navigation";

// Increase cache duration and add error boundary
export const revalidate = 300; // 5 minutes

export default async function PublicHomePage({
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
