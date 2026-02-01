export default function CanonPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto max-w-3xl px-4 py-32">
        <div className="space-y-12">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              SELECTD
            </h1>
            <p className="text-foreground/60 uppercase tracking-widest text-sm">
              A Post-Algorithmic Music Canon
            </p>
          </div>

          {/* Manifesto */}
          <div className="space-y-8 text-foreground/80 leading-relaxed border-t border-border pt-12">
            <p>The age of abundance is over.</p>

            <p>
              Not because less is being made,<br />
              but because too much is.
            </p>

            <p>
              Algorithms optimise for engagement.<br />
              Markets reward volume.<br />
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
                SELECTD does not follow trends.<br />
                It does not reward popularity.<br />
                It does not explain itself.
              </p>
            </div>

            <p>
              The canon is permanent.<br />
              Entries are not revised, re-ranked, or removed.
            </p>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-foreground">
                In a world where everything can be generated,<br />
                what matters is what endures.
              </p>
            </div>

            <p>
              SELECTD is not here to amplify noise.<br />
              It exists to preserve signal.
            </p>
          </div>

          {/* The Asymmetry */}
          <div className="border-t border-border pt-12 space-y-8">
            <h2 className="text-sm uppercase tracking-widest text-foreground/40">
              The Asymmetry
            </h2>

            <div className="space-y-6 text-foreground/80">
              <div>
                <p className="text-foreground/60 text-sm mb-2">AI asks:</p>
                <p className="text-lg">"What can be made?"</p>
              </div>

              <div>
                <p className="text-foreground/60 text-sm mb-2">SELECTD answers:</p>
                <p className="text-lg text-foreground">"What matters?"</p>
              </div>
            </div>

            <p className="text-sm text-foreground/60">
              SELECTD is not competing with AI.<br />
              It is positioned after AI.
            </p>
          </div>

          {/* Canon Principles */}
          <div className="border-t border-border pt-12 space-y-8">
            <h2 className="text-sm uppercase tracking-widest text-foreground/40">
              Canon Principles
            </h2>

            <div className="space-y-4 text-sm text-foreground/70">
              <div className="border-l-2 border-foreground/20 pl-4">
                <p className="text-foreground mb-1">Permanence</p>
                <p>Once canonized, works are never deleted, re-ranked, or revised.</p>
              </div>

              <div className="border-l-2 border-foreground/20 pl-4">
                <p className="text-foreground mb-1">Timestamp</p>
                <p>Each entry carries the exact moment of selection.</p>
              </div>

              <div className="border-l-2 border-foreground/20 pl-4">
                <p className="text-foreground mb-1">Scarcity</p>
                <p>Selection is rare by design. Most works are not chosen.</p>
              </div>

              <div className="border-l-2 border-foreground/20 pl-4">
                <p className="text-foreground mb-1">Silence</p>
                <p>Rejection carries no feedback. There are no appeals.</p>
              </div>

              <div className="border-l-2 border-foreground/20 pl-4">
                <p className="text-foreground mb-1">Historical Record</p>
                <p>The canon functions as cultural archive, not feed.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-12 text-center">
            <p className="text-sm text-foreground/40">
              Feeds rot. Canons endure.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
