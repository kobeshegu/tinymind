import Link from "next/link";
import { SITE_NAME, SITE_OWNER } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p>{SITE_NAME} · Researcher in multimodal generative modeling</p>
        <div className="site-footer-links">
          <Link href="/">Home</Link>
          <Link href={`https://github.com/${SITE_OWNER}`}>GitHub</Link>
          <Link href={`https://github.com/${SITE_OWNER}/tinymind-blog`}>
            Content repository
          </Link>
        </div>
      </div>
    </footer>
  );
}
