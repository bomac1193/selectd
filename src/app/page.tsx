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
              Taste, distilled.
            </p>
          </div>

          <div className="space-y-6 border-t border-border pt-12">
            <p className="text-lg leading-relaxed text-foreground/80">
              Every day, thousands of tracks are released.<br />
              Most do not matter.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              SELECTD exists to decide what does.
            </p>
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
              What SELECTD Is
            </h2>
            <p className="text-center text-xl leading-relaxed text-foreground/80">
              A private system for identifying music with cultural weight.
            </p>
            <div className="space-y-2 text-center text-foreground/60">
              <p>No genres.</p>
              <p>No trends.</p>
              <p>No explanations.</p>
            </div>
            <p className="text-center text-lg text-foreground/80">
              Only outcomes.
            </p>
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
              <h3 className="text-sm uppercase tracking-wider">Work is reviewed</h3>
            </div>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-light text-foreground/40">03</div>
              <h3 className="text-sm uppercase tracking-wider">Selection is issued</h3>
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
            Selection is discretionary.<br />
            Outcomes are final.
          </p>
          <p className="text-sm text-foreground/40">
            No correspondence is entered into.
          </p>
          <div className="pt-8">
            <p className="text-xs text-foreground/30">
              Distilled by Ubani
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
