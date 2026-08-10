import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerMarkdownRenderer } from "@/components/shared/ServerMarkdownRenderer";
import { format } from "date-fns";

export function PublicBlogPostContent({
  title,
  date,
  content,
}: {
  title: string;
  date: string;
  content: string;
}) {
  return (
    <Card className="mx-auto mt-8 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        <p className="text-sm text-gray-500">
          {format(new Date(date), "MMMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none dark:prose-invert">
          <ServerMarkdownRenderer content={content} />
        </div>
      </CardContent>
    </Card>
  );
}
