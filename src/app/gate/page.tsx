import Link from "next/link";

export default function GatePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md space-y-12 text-center">
        {/* Institution Name */}
        <h1 className="text-2xl font-bold tracking-wide">
          SELECTD
        </h1>

        {/* Consent Gate */}
        <div className="space-y-8 border-t border-border pt-8">
          <p className="text-sm uppercase tracking-widest text-foreground/40">
            Before proceeding
          </p>

          <div className="space-y-4 text-foreground/70">
            <p>This is a judgement system.</p>
            <p>Not all work is suitable.</p>
          </div>

          <div className="space-y-3 text-sm text-foreground/60">
            <p>There is no feedback.</p>
            <p>There are no appeals.</p>
          </div>

          <div className="pt-4 text-foreground/70">
            <p>If selected, you will know.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <Link
            href="/submit"
            className="px-8 py-3 border border-foreground bg-background text-sm uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            Proceed
          </Link>
          <Link
            href="/"
            className="px-8 py-3 text-sm uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors"
          >
            Exit
          </Link>
        </div>
      </div>
    </main>
  );
}
