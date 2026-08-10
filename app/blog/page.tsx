import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import BlogList from "@/components/BlogList";
import { getBlogPosts } from "@/lib/githubApi";
import GitHubSignInButton from "@/components/GitHubSignInButton";

export const revalidate = 60;

export default async function BlogPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return <GitHubSignInButton />;
  }

  let posts;
  let loadError: unknown;
  try {
    posts = await getBlogPosts(session.accessToken);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    loadError = error;
  }

  if (loadError) {
    return (
      <div className="error-message">
        Blog posts are temporarily unavailable. Please try again shortly.
      </div>
    );
  }

  return <BlogList posts={posts ?? []} />;
}
