"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorContent() {
  const params = useSearchParams();
  const error = params?.get("error") || "Authentication failed.";

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Authentication Error
        </h1>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
