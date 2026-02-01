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
            <p>The age of abundance is over.</p>

            <p>
              Not because less is being made,<br />
              but because too much is.
            </p>

            <p>
              Algorithms optimise for engagement.<br />
              Artificial intelligence accelerates everything.
            </p>

            <p className="text-foreground">Meaning collapses.</p>

            <div className="border-t border-border pt-8 mt-8">
              <p>SELECTD exists for what remains.</p>
            </div>

            <p>
              This is not a platform for discovery.<br />
              It is not a community.<br />
              It is not a marketplace.
            </p>

            <p className="text-foreground">It is a judgement system.</p>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                Works are submitted.<br />
                They are evaluated under constraint.<br />
                They are either selected or ignored.
              </p>
            </div>

            <p>
              Selection is rare.<br />
              Rejection is silent.<br />
              Outcomes are final.
            </p>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                The canon is permanent.<br />
                No revisions.<br />
                No re-rankings.<br />
                No deletions.
              </p>
            </div>

            <p className="text-foreground">
              In a world where everything can be generated,<br />
              what matters is what endures.
            </p>

            <div className="border-t border-border pt-8 mt-8">
              <p>
                AI may assist in creation.<br />
                Humans remain responsible for judgement.
              </p>
            </div>

            <p className="text-foreground">
              The future does not belong to those who generate the most,<br />
              but to those who decide what endures.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-12 space-y-6">
            <p className="text-xs text-foreground/30 text-center">
              Distilled by Ubani
            </p>
            <div className="text-center">
              <Link
                href="/canon"
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
