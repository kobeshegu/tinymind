import type { Metadata } from "next";
import PublicThoughtsList from "@/components/PublicThoughtsList";
import { getPublicThoughts } from "@/lib/publicData";
import { SITE_NAME, SITE_OWNER, SITE_URL } from "@/lib/site";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Thoughts | ${SITE_NAME}`,
  description:
    "Short observations on research, engineering, visual generation, and artificial intelligence.",
  alternates: { canonical: `${SITE_URL}/thoughts` },
};

export default async function ThoughtsPage() {
  const thoughts = await getPublicThoughts(SITE_OWNER);

  return (
    <section className="page-shell page-shell-narrow">
      <div className="page-intro">
        <p className="page-kicker">Field notes</p>
        <h1>Thoughts</h1>
        <p>
          Short observations, open questions, and ideas still taking shape.
        </p>
      </div>
      <PublicThoughtsList thoughts={thoughts} />
    </section>
  );
}
