import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAboutPage } from "@/lib/githubApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GitHubSignInButton from "@/components/GitHubSignInButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FiEdit } from "react-icons/fi";
import { getTranslations } from "next-intl/server";
import { ServerMarkdownRenderer } from "@/components/shared/ServerMarkdownRenderer";

export const revalidate = 60;

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("HomePage");

  if (!session || !session.accessToken) {
    return <GitHubSignInButton />;
  }

  let aboutPage;
  let loadError: unknown;
  try {
    aboutPage = await getAboutPage(session.accessToken);
  } catch (error) {
    console.error("Error fetching about page:", error);
    loadError = error;
  }

  if (loadError) {
    return (
      <div className="error-message">
        The about page is temporarily unavailable. Please try again shortly.
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="border-b border-gray-100 pb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{t("about")}</h1>
              <Button variant="outline" asChild size="sm">
                <Link href="/editor?type=about">
                  <FiEdit className="mr-1" />
                  {t("edit")}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            {aboutPage ? (
              <div className="prose max-w-none text-gray-800">
                <ServerMarkdownRenderer content={aboutPage.content} />
              </div>
            ) : (
              <div className="text-center text-gray-400 py-10">
                <p className="mb-4">
                  You haven&apos;t created an about page yet.
                </p>
                <Button asChild>
                  <Link href="/editor?type=about">
                    {t("createAboutPage") || "Create About Page"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
