import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* The Seal - Nothing else */}
      <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center" style={{ marginTop: "20vh" }}>
          {/* Institution Name - Desktop: 96px / Mobile: 48px */}
          <h1 className="font-normal">
            <span
              className="hidden md:inline"
              style={{
                fontSize: "96px",
                letterSpacing: "0.12em",
                lineHeight: "1.0",
              }}
            >
              SELECTD
            </span>
            <span
              className="md:hidden"
              style={{
                fontSize: "48px",
                letterSpacing: "0.12em",
                lineHeight: "1.0",
              }}
            >
              SELECTD
            </span>
          </h1>

          {/* Law / Axiom - Desktop: 32px / Mobile: 18px */}
          <p className="font-normal">
            <span
              className="hidden md:inline"
              style={{
                fontSize: "32px",
                letterSpacing: "0.18em",
                lineHeight: "1.2",
                marginTop: "48px",
                display: "inline-block",
              }}
            >
              WHAT MATTERS
            </span>
            <span
              className="md:hidden"
              style={{
                fontSize: "18px",
                letterSpacing: "0.18em",
                lineHeight: "1.2",
                marginTop: "34px",
                display: "inline-block",
              }}
            >
              WHAT MATTERS
            </span>
          </p>

          {/* Threshold Action - Desktop: 14px / Mobile: 12px */}
          <Link
            href="/login"
            className="inline-block font-sans font-normal transition-opacity hover:opacity-60"
          >
            <span
              className="hidden md:inline"
              style={{
                fontSize: "14px",
                letterSpacing: "0.08em",
                lineHeight: "1.4",
                marginTop: "64px",
                display: "inline-block",
              }}
            >
              [ Enter ]
            </span>
            <span
              className="md:hidden"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                lineHeight: "1.4",
                marginTop: "45px",
                display: "inline-block",
              }}
            >
              [ Enter ]
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
