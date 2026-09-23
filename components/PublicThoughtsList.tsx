"use client";

import { useMemo } from "react";
import type { Thought } from "@/lib/contentTypes";
import { formatTimestamp } from "@/utils/dateFormatting";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

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
  const formattedThoughts = useMemo<FormattedThought[]>(() =>
    thoughts.map(formatThought), [thoughts]);

  return (
    <div className="thought-stream">
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
          <div className="prose thought-content">
            <MarkdownRenderer content={thought.displayContent} />
          </div>
        </details>
      ))}
    </div>
  );
}
