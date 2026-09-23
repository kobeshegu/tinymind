import { ServerMarkdownRenderer } from "@/components/shared/ServerMarkdownRenderer";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PublicBlogPostContent({
  title,
  date,
  content,
  backHref = "/blog",
}: {
  title: string;
  date: string;
  content: string;
  backHref?: string;
}) {
  return (
    <article className="article-shell">
      <Link href={backHref} className="article-back">
        <ArrowLeft aria-hidden="true" />
        All writing
      </Link>
      <header className="article-header">
        <p className="page-kicker">Essay</p>
        <h1>{title}</h1>
        <time dateTime={date}>{format(new Date(date), "MMMM d, yyyy")}</time>
      </header>
      <div className="article-rule" />
      <div className="article-body">
        <div className="prose max-w-none">
          <ServerMarkdownRenderer content={content} />
        </div>
      </div>
    </article>
  );
}
