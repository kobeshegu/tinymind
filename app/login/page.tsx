"use client";

import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="login-shell">
      <div className="login-panel">
        <Link href="/blog" className="article-back">
          <ArrowLeft aria-hidden="true" />
          Back to writing
        </Link>
        <p className="page-kicker">Owner access</p>
        <h1>Sign in to write</h1>
        <p>
          Publishing access is restricted to the GitHub account that owns this
          site.
        </p>
        <div>
          <Button
            onClick={() => signIn("github", { callbackUrl: "/blog" })}
            className="login-button"
          >
            <FaGithub className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
