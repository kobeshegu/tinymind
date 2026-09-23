import type { Metadata } from "next";
import PublicBlogList from "@/components/PublicBlogList";
import { getPublicBlogPosts } from "@/lib/publicData";
import { SITE_NAME, SITE_OWNER, SITE_URL } from "@/lib/site";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Personal Blog | ${SITE_NAME}`,
  description:
    "Research notes and essays on multimodal learning, visual generation, and intelligent systems.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage() {
  const posts = await getPublicBlogPosts(SITE_OWNER);

  return (
    <section className="page-shell">
      <header className="blog-masthead">
        <div className="science-lines" aria-hidden="true">
          <span className="science-line science-line-a" />
          <span className="science-line science-line-b" />
          <span className="science-line science-line-c" />
          <span className="science-node science-node-a" />
          <span className="science-node science-node-b" />
          <span className="science-node science-node-c" />
        </div>
        <div className="blog-masthead-copy">
          <p className="blog-masthead-label">Personal Blog</p>
          <h1>Research begins at the edge of certainty.</h1>
          <blockquote>
            “If we knew what it was we were doing, it would not be called
            research, would it?”
            <cite>Albert Einstein</cite>
          </blockquote>
        </div>
        <div className="blog-masthead-index" aria-hidden="true">
          <span>01 / VISION</span>
          <span>02 / GENERATION</span>
          <span>03 / INTELLIGENCE</span>
        </div>
      </header>
      <PublicBlogList posts={posts} username={SITE_OWNER} basePath="/blog" />
    </section>
  );
}
