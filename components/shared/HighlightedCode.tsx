"use client";

import React from "react";
import { SyntaxHighlighter } from "@/components/shared/syntaxHighlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function HighlightedCode({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  return (
    <SyntaxHighlighter
      style={tomorrow as { [key: string]: React.CSSProperties }}
      language={language}
      PreTag="div"
    >
      {children}
    </SyntaxHighlighter>
  );
}
