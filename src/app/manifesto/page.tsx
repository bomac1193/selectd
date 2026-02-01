import Link from "next/link";

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto max-w-3xl px-4 py-32">
        <div className="space-y-12">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              SELECTD
            </h1>
            <p className="text-foreground/60 text-sm">
              Manifesto
            </p>
          </div>

          {/* Manifesto Body */}
          <div className="space-y-8 text-foreground/80 leading-relaxed border-t border-border pt-12">
            <p>
              The age of abundance has already arrived.<br />
              Creation is infinite.<br />
              Judgement is extinct.
            </p>

            <p>
              Artificial intelligence accelerates everything.<br />
              Algorithms amplify anything.<br />
              Nothing slows down.<br />
              Nothing holds up.<br />
              Nothing endures.
            </p>

            <p>
              Taste has been flattened into trend.<br />
              Curation has collapsed into consensus.<br />
              Meaning drowns in volume.
            </p>

            <p className="text-foreground">
              SELECTD was not built to surface content.<br />
              It was built to draw a line.
            </p>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                This is not a platform.<br />
                Not a community.<br />
                Not a marketplace.<br />
                Not a leaderboard.<br />
                Not a social product.
              </p>

              <p className="text-foreground mt-6">It is a judgement system.</p>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                Works are submitted.<br />
                They are reviewed under constraint.<br />
                They are either SELECTED or ignored.
              </p>

              <p className="mt-6">
                No feedback.<br />
                No revisions.<br />
                No votes.<br />
                No appeals.
              </p>

              <p className="text-foreground mt-6">Outcomes are final.</p>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                Canonization is rare.<br />
                Omission is silent.<br />
                There is no debate.
              </p>

              <p className="mt-6">
                The canon does not update.<br />
                The canon does not explain itself.<br />
                The canon endures.
              </p>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                AI may assist in creation.<br />
                But only humans can declare meaning.<br />
                That task is not obsolete — only avoided.
              </p>
            </div>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                This system is not for discovery.<br />
                Not for growth.<br />
                Not for reach.
              </p>

              <p className="mt-6">
                It is for those who already know what they've made.<br />
                And are ready to be judged.
              </p>
            </div>

            <p className="text-foreground">
              If selected, you will know.<br />
              If not, you won't.
            </p>

            <p className="text-foreground">There is nothing else.</p>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-12 space-y-6">
            <p className="text-xs text-foreground/30 text-center">
              Distilled by Ubani
            </p>
            <div className="text-center">
              <Link
                href="/about"
                className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors font-normal"
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                }}
              >
                Return →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
