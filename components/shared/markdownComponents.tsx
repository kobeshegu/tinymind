import React, { HTMLAttributes, lazy, Suspense } from "react";
import { transformGithubImageUrl } from "@/lib/urlUtils";

interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const HighlightedCode = lazy(
  () => import("@/components/shared/HighlightedCode")
);

/** Shared by the plain and math-capable renderers so they stay identical. */
export const markdownComponents = {
  code: ({ inline, className, children, ...props }: CodeProps) => {
    const match = /language-([^\s]+)/.exec(className || "");
    return !inline && match ? (
      <Suspense
        fallback={
          <code className={className} {...props}>
            {children}
          </code>
        }
      >
        <HighlightedCode language={match[1]}>
          {String(children).replace(/\n$/, "")}
        </HighlightedCode>
      </Suspense>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a: ({ children, ...props }: { children?: React.ReactNode; href?: string }) => (
    <a
      {...props}
      className="text-gray-400 no-underline hover:text-gray-600 hover:underline hover:underline-offset-4 transition-colors duration-200 break-words"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <div className="pl-4 border-l-4 border-gray-200 text-gray-400">
      {children}
    </div>
  ),
  img: (props: { src?: string; alt?: string }) => {
    const transformedSrc = transformGithubImageUrl(props.src);
    return (
      <img
        {...props}
        src={transformedSrc}
        alt={props.alt || "image"}
        loading="lazy"
        decoding="async"
      />
    );
  },
};
