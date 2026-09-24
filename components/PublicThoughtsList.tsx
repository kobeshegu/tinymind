"use client";

import { useMemo, useState } from "react";
import type { Thought } from "@/lib/contentTypes";
import { formatTimestamp } from "@/utils/dateFormatting";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
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

type FormattedThought = Thought & {
  formattedTimestamp: string;
  displayTitle: string;
  displaySummary: string;
  displayContent: string;
};

function toPlainText(content: string) {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatThought(thought: Thought): FormattedThought {
  const heading = thought.content.match(
    /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/m
  );
  const firstLine = thought.content
    .split("\n")
    .map((line) => toPlainText(line))
    .find(Boolean);
  const displayTitle = toPlainText(heading?.[1] ?? firstLine ?? "Untitled thought")
    .slice(0, 80)
    .trim();
  const displayContent = heading
    ? thought.content.replace(heading[0], "").trimStart()
    : thought.content;
  const plainContent = toPlainText(displayContent);
  const summarySource =
    !heading && plainContent.startsWith(displayTitle)
      ? plainContent.slice(displayTitle.length).replace(/^[:：\s]+/, "")
      : plainContent;
  const displaySummary =
    summarySource.length > 180
      ? `${summarySource.slice(0, 180).trim()}...`
      : summarySource;

  return {
    ...thought,
    formattedTimestamp: formatTimestamp(thought.timestamp),
    displayTitle,
    displaySummary: displaySummary || displayTitle,
    displayContent,
  };
}

export default function PublicThoughtsList({
  thoughts,
}: {
  thoughts: Thought[];
}) {
  const [deletedThoughtIds, setDeletedThoughtIds] = useState<Set<string>>(
    () => new Set()
  );
  const [thoughtToDelete, setThoughtToDelete] = useState<Thought | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const isOwner =
    session?.user?.username?.toLowerCase() === SITE_OWNER.toLowerCase();

  const formattedThoughts = useMemo<FormattedThought[]>(
    () =>
      thoughts
        .filter((thought) => !deletedThoughtIds.has(thought.id))
        .map(formatThought),
    [deletedThoughtIds, thoughts]
  );

  const handleDelete = async () => {
    const target = thoughtToDelete;
    if (!target) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteThought",
          id: target.id,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete thought");
      }

      setDeletedThoughtIds((current) => {
        const next = new Set(current);
        next.add(target.id);
        return next;
      });
      setThoughtToDelete(null);
      toast({
        title: "Thought deleted",
        description: "The deletion was synced to GitHub.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Failed to delete thought",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="thought-stream">
      <Dialog
        open={thoughtToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setThoughtToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this thought?</DialogTitle>
            <DialogDescription>
              This removes &ldquo;
              {thoughtToDelete &&
                formatThought(thoughtToDelete).displayTitle}
              &rdquo; and commits the deletion to GitHub. Git history can still
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
      {formattedThoughts.map((thought) => (
        <details key={thought.id} className="thought-card">
          <summary>
            <span className="thought-accent" aria-hidden="true" />
            <span className="thought-title">{thought.displayTitle}</span>
            <span className="thought-summary">
              {thought.displaySummary}
            </span>
            <span className="thought-summary-meta">
              <time dateTime={thought.timestamp}>
                {thought.formattedTimestamp}
              </time>
              <span className="disclosure-label">
                <span className="label-expand">Expand</span>
                <span className="label-collapse">Collapse</span>
                <ChevronDown className="icon-expand" aria-hidden="true" />
                <ChevronUp className="icon-collapse" aria-hidden="true" />
              </span>
            </span>
          </summary>
          <div className="thought-content">
            <div className="prose max-w-none">
              <MarkdownRenderer content={thought.displayContent} />
            </div>
            {isOwner && (
              <div className="entry-actions thought-entry-actions">
                <Link
                  href={`/editor?type=thought&id=${encodeURIComponent(
                    thought.id
                  )}`}
                  className="entry-action"
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
                <button
                  type="button"
                  className="entry-action entry-action-danger"
                  onClick={() => setThoughtToDelete(thought)}
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
