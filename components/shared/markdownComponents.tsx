import React, { HTMLAttributes } from "react";
import { SyntaxHighlighter } from "@/components/shared/syntaxHighlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { transformGithubImageUrl } from "@/lib/urlUtils";

interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const syntaxStyle = tomorrow as { [key: string]: React.CSSProperties };

/** Shared by the plain and math-capable renderers so they stay identical. */
export const markdownComponents = {
  code: ({ inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter style={syntaxStyle} language={match[1]} PreTag="div">
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
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
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={transformedSrc} alt={props.alt || "image"} />;
  },
};

/**
 * Whether the content needs KaTeX.
 *
 * KaTeX plus its stylesheet is ~77 KB gzip, and most posts contain no math at
 * all, so it is loaded on demand. The patterns mirror remark-math's delimiters:
 * a bare "$" as in "$25" does not qualify, since inline math needs a closing
 * delimiter on the same line with no space after the opening one. Guessing
 * wrong in the "yes" direction only costs a download, so err that way.
 */
export function containsMath(content: string): boolean {
  return (
    /\$\$/.test(content) ||
    /\$[^\s$][^$\n]*\$/.test(content) ||
    /\\\(/.test(content) ||
    /\\\[/.test(content) ||
    /\\begin\{/.test(content)
  );
}
