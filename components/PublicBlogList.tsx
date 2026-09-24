"use client";

import { useMemo, useState, memo } from "react";
import type { BlogPost } from "@/lib/contentTypes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { stripFrontmatter } from "@/lib/content";
import { SITE_OWNER } from "@/lib/site";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(
    () => new Set()
  );
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const isOwner =
    session?.user?.username?.toLowerCase() === SITE_OWNER.toLowerCase();

  const sortedPosts = useMemo(
    () =>
      posts
        .filter((post) => !deletedPostIds.has(post.id))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
    [deletedPostIds, posts]
  );

  const handleDelete = async () => {
    const target = postToDelete;
    if (!target) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteBlogPost",
          id: target.id,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete blog post");
      }

      setDeletedPostIds((current) => {
        const next = new Set(current);
        next.add(target.id);
        return next;
      });
      setPostToDelete(null);
      toast({
        title: "Blog deleted",
        description: "The deletion was synced to GitHub.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (sortedPosts.length === 0) {
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
      <Dialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPostToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this blog post?</DialogTitle>
            <DialogDescription>
              This removes &ldquo;{postToDelete?.title}&rdquo; from the blog
              and commits the deletion to GitHub. Git history can still
              restore it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                    <div className="entry-footer">
                      <Link
                        href={`${
                          basePath ?? `/${username}/blog`
                        }/${encodeURIComponent(post.id)}`}
                        className="writing-open"
                      >
                        Open article
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                      {isOwner && (
                        <div className="entry-actions">
                          <Link
                            href={`/editor?type=blog&id=${encodeURIComponent(
                              post.id
                            )}`}
                            className="entry-action"
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="entry-action entry-action-danger"
                            onClick={() => setPostToDelete(post)}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
