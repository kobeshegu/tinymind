import React, { HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SyntaxHighlighter } from "@/components/shared/syntaxHighlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { transformGithubImageUrl } from "@/lib/urlUtils";
import { containsMath } from "@/lib/markdown";
import "katex/dist/katex.min.css";

interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const syntaxStyle = tomorrow as { [key: string]: React.CSSProperties };

export function ServerMarkdownRenderer({ content }: { content: string }) {
  const math = containsMath(content);

  return (
    <ReactMarkdown
      remarkPlugins={math ? [remarkGfm, remarkMath] : [remarkGfm]}
      rehypePlugins={math ? [rehypeKatex] : []}
      components={{
        code: ({ inline, className, children, ...props }: CodeProps) => {
          const match = /language-([^\s]+)/.exec(className || "");
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
        a: ({ children, ...props }) => (
          <a
            {...props}
            className="break-words text-gray-400 no-underline transition-colors duration-200 hover:text-gray-600 hover:underline hover:underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <div className="border-l-4 border-gray-200 pl-4 text-gray-400">
            {children}
          </div>
        ),
        img: (props) => {
          const transformedSrc = transformGithubImageUrl(props.src);
          // Markdown authors control dimensions, so next/image cannot infer a
          // stable aspect ratio here. Native lazy loading avoids blocking LCP.
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
