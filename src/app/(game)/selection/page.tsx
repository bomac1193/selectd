import { auth } from "@/lib/auth";
import { getActiveSelections } from "@/lib/selection";
import { getUserDrops } from "@/lib/drop";
import { SelectionCard } from "@/components/selection/SelectionCard";
import { Button, Card } from "@/components/ui";
import Link from "next/link";

export default async function SelectionPage({
  searchParams,
}: {
  searchParams?: Promise<{ track1?: string; track2?: string; discord?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const params = searchParams ? await searchParams : {};

  const [selections, userDrops] = await Promise.all([
    getActiveSelections(20),
    userId ? getUserDrops(userId, "APPROVED") : [],
  ]);

  const hasDrops = userDrops.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          Selections
        </h1>
      </div>

      {/* Active Selections */}
      {selections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selections.map((selection) => (
            <SelectionCard key={selection.id} selection={selection as any} />
          ))}
        </div>
      ) : (
        <div className="border border-border p-12 text-center">
          <p className="text-foreground/40 text-sm uppercase tracking-wider">
            —
          </p>
        </div>
      )}
    </div>
  );
}
