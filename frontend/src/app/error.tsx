"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-[70vh] place-items-center bg-cream px-6 py-16 text-center">
      <div className="max-w-md">
        <h1 className="display-md">Something went a little wrong</h1>
        <p className="mt-4 text-cocoa-500">Please try again. If it keeps happening, let us know{error.digest ? ` (reference ${error.digest})` : ""}.</p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
