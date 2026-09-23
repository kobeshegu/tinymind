"use client";

import { useMemo, memo } from "react";
import type { BlogPost } from "@/lib/contentTypes";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { stripFrontmatter } from "@/lib/content";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
}

function PublicBlogListComponent({
  posts,
  username,
  basePath,
}: {
  posts: BlogPost[];
  username: string;
  basePath?: string;
}) {
  // Use useMemo instead of useEffect+useState for sorting
  const sortedPosts = useMemo(() =>
    [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ), [posts]);

  // Show message if no posts
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>No essays published yet.</p>
      </div>
    );
  }

  const groupedPosts = sortedPosts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, BlogPost[]>);

  const sortedYears = Object.keys(groupedPosts).sort(
    (a, b) => Number(b) - Number(a)
  );

  return (
    <div className="writing-index">
      {sortedYears.map((year) => (
        <section key={year} className="writing-year">
          <h2>{year}</h2>
          <ol>
            {groupedPosts[Number(year)].map((post) => (
              <li key={post.id}>
                <details className="writing-entry">
                  <summary>
                    <span className="writing-title">{post.title}</span>
                    <span className="writing-meta">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="disclosure-label">
                        <span className="label-expand">Expand</span>
                        <span className="label-collapse">Collapse</span>
                        <ChevronDown
                          className="icon-expand"
                          aria-hidden="true"
                        />
                        <ChevronUp
                          className="icon-collapse"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </summary>
                  <div className="writing-preview">
                    <div className="prose max-w-none">
                      <MarkdownRenderer
                        content={stripFrontmatter(post.content)}
                      />
                    </div>
                    <Link
                      href={`${
                        basePath ?? `/${username}/blog`
                      }/${encodeURIComponent(post.id)}`}
                      className="writing-open"
                    >
                      Open article
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export default memo(PublicBlogListComponent);
