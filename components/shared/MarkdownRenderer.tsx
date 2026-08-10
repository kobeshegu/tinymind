"use client";

import React, { memo, Suspense, lazy } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/components/shared/markdownComponents";
import { containsMath } from "@/lib/markdown";

const MathMarkdown = lazy(() => import("@/components/shared/MathMarkdown"));

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const remarkPlugins = [remarkGfm];

function PlainMarkdown({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      components={markdownComponents}
      className={className}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * Shared memoized Markdown renderer.
 *
 * Math support is loaded only for content that contains math. The Suspense
 * fallback renders the same markdown without it, so the surrounding layout is
 * already in place and only the formulas themselves resolve late.
 */
function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
  if (containsMath(content)) {
    return (
      <Suspense fallback={<PlainMarkdown content={content} className={className} />}>
        <MathMarkdown content={content} className={className} />
      </Suspense>
    );
  }

  return <PlainMarkdown content={content} className={className} />;
}

export const MarkdownRenderer = memo(MarkdownRendererComponent);
