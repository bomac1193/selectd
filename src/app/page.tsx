import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero - Stark & Minimal */}
      <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-2xl space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              SELECTD
            </h1>
            <p className="text-xl text-foreground/60">
              A Post-Algorithmic Music Canon
            </p>
          </div>

          <div className="space-y-6 border-t border-border pt-12">
            <div className="space-y-4">
              <p className="text-base text-foreground/60">AI asks:</p>
              <p className="text-2xl leading-relaxed text-foreground/80">
                "What can be made?"
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-base text-foreground/60">SELECTD answers:</p>
              <p className="text-2xl leading-relaxed text-foreground">
                "What matters?"
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-block border border-foreground bg-background px-12 py-4 text-sm uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Enter
          </Link>
        </div>
      </section>

      {/* What SELECTD Is */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto max-w-3xl space-y-16 px-4">
          <div className="space-y-8">
            <h2 className="text-center text-sm uppercase tracking-widest text-foreground/40">
              The Canon
            </h2>
            <p className="text-center text-xl leading-relaxed text-foreground/80">
              In a world where everything can be generated,<br />
              what matters is what endures.
            </p>
            <div className="space-y-2 text-center text-foreground/60">
              <p>No revisions.</p>
              <p>No re-rankings.</p>
              <p>No deletions.</p>
            </div>
            <p className="text-center text-lg text-foreground/80">
              Permanent cultural record.
            </p>
            <div className="pt-8">
              <Link
                href="/canon"
                className="text-sm text-foreground/60 hover:text-foreground border-b border-foreground/20 hover:border-foreground transition-colors"
              >
                Read the full manifesto →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What SELECTD Is Not */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto max-w-3xl space-y-16 px-4">
          <div className="space-y-8">
            <h2 className="text-center text-sm uppercase tracking-widest text-foreground/40">
              What SELECTD Is Not
            </h2>
            <div className="space-y-3 text-center text-foreground/60">
              <p>Not a community</p>
              <p>Not a leaderboard</p>
              <p>Not a debate</p>
              <p>Not a marketplace for attention</p>
            </div>
            <p className="text-center text-lg text-foreground/80">
              Taste does not argue.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto max-w-3xl space-y-16 px-4">
          <h2 className="text-center text-sm uppercase tracking-widest text-foreground/40">
            How It Works
          </h2>

          <div className="grid gap-16 md:grid-cols-3">
            <div className="space-y-4 text-center">
              <div className="text-4xl font-light text-foreground/40">01</div>
              <h3 className="text-sm uppercase tracking-wider">Submit work</h3>
            </div>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-light text-foreground/40">02</div>
              <h3 className="text-sm uppercase tracking-wider">Work is evaluated</h3>
            </div>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-light text-foreground/40">03</div>
              <h3 className="text-sm uppercase tracking-wider">Canon entry issued</h3>
            </div>
          </div>

          <p className="text-center text-foreground/60">
            Nothing else happens.
          </p>

          <div className="space-y-4 border-t border-border pt-8 text-center text-foreground/60">
            <p>If you are selected, you will know.</p>
            <p>If you are not, nothing is owed.</p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto max-w-3xl space-y-16 px-4">
          <h2 className="text-center text-sm uppercase tracking-widest text-foreground/40">
            Who This Is For
          </h2>

          <p className="text-center text-lg leading-relaxed text-foreground/80">
            Producers, DJs, artists, and curators<br />
            who already know their work stands apart<br />
            and do not require validation.
          </p>

          <div className="space-y-3 border-t border-border pt-8 text-center text-foreground/60">
            <p>If you need encouragement, this is not for you.</p>
            <p>If you need feedback, this is not for you.</p>
          </div>

          <p className="text-center text-lg text-foreground/80">
            If you trust your taste — proceed.
          </p>
        </div>
      </section>

      {/* Final Statement */}
      <section className="border-t border-border py-32">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <p className="text-2xl font-light tracking-wide text-foreground">
            Selection is final.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto max-w-3xl space-y-4 px-4 text-center">
          <p className="text-sm text-foreground/40">
            Canonization is discretionary.<br />
            Outcomes are final.
          </p>
          <p className="text-sm text-foreground/40">
            No correspondence is entered into.
          </p>
          <div className="pt-4">
            <Link
              href="/canon"
              className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Manifesto
            </Link>
          </div>
          <div className="pt-4">
            <p className="text-xs text-foreground/30">
              Distilled by Ubani
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
