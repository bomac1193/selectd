import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "SELECTD - The Taste Selection Game",
  description: "Prove your taste. Drop tracks. Win selections. Rise to the top.",
  keywords: ["music", "selection", "game", "taste", "curator", "discovery"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
