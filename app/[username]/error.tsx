"use client";

import { Button } from "@/components/ui/button";

export default function PublicProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold">Temporarily unavailable</h1>
      <p className="mb-6 text-gray-600">
        This profile could not be loaded right now. Please try again shortly.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
