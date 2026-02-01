import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* The Seal - Nothing else */}
      <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center" style={{ marginTop: "20vh" }}>
          {/* Institution Name */}
          <h1
            className="font-normal"
            style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              letterSpacing: "0.12em",
              lineHeight: "1.0",
            }}
          >
            SELECTD
          </h1>

          {/* Law / Axiom */}
          <p
            className="font-normal"
            style={{
              fontSize: "clamp(18px, 4vw, 32px)",
              letterSpacing: "0.18em",
              lineHeight: "1.2",
              marginTop: "clamp(34px, 5vw, 48px)",
            }}
          >
            WHAT MATTERS
          </p>

          {/* Threshold Action */}
          <Link
            href="/gate"
            className="inline-block font-sans font-normal transition-opacity hover:opacity-60"
            style={{
              fontSize: "clamp(12px, 2vw, 14px)",
              letterSpacing: "0.08em",
              lineHeight: "1.4",
              marginTop: "clamp(45px, 7vw, 64px)",
            }}
          >
            [ Enter ]
          </Link>
        </div>
      </section>
    </main>
  );
}
