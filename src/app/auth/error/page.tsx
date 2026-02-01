import { Suspense } from "react";
import ErrorContent from "./ErrorContent";

export const dynamic = "force-dynamic";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
