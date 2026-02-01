import Link from "next/link";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md space-y-12 text-center">
        {/* Action Header */}
        <h1 className="text-2xl font-bold tracking-wide uppercase">
          Submit Work
        </h1>

        {/* Constraints */}
        <div className="space-y-4 text-foreground/70 border-t border-border pt-8">
          <p>Upload one work.</p>
          <div className="space-y-2 text-sm text-foreground/60">
            <p>No revisions.</p>
            <p>No feedback.</p>
            <p>No appeals.</p>
          </div>
        </div>

        {/* Upload Action - Triggers Auth */}
        <div className="pt-4">
          <Link
            href="/login?callbackUrl=/upload"
            className="inline-block px-12 py-4 border border-foreground bg-background text-sm uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            Upload
          </Link>
        </div>

        {/* Footer Links - Buried */}
        <div className="pt-12 border-t border-border">
          <div className="flex items-center justify-center gap-8 text-xs text-foreground/40">
            <Link
              href="/canon"
              className="hover:text-foreground/60 transition-colors"
              style={{ fontSize: "12px" }}
            >
              Canon →
            </Link>
            <Link
              href="/manifesto"
              className="hover:text-foreground/60 transition-colors"
              style={{ fontSize: "12px" }}
            >
              Manifesto →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
