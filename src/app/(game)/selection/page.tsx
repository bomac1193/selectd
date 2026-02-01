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
      {(params.track1 || params.track2) && (
        <div className="border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/40 mb-2">
                Discord selection link
              </div>
              <div className="text-base font-semibold">
                {params.track1 || "Track A"} vs{" "}
                {params.track2 || "Track B"}
              </div>
              <p className="text-sm text-foreground/60">
                Submit tracks to create selection
              </p>
            </div>
            <Link href="/drop">
              <Button variant="primary" className="uppercase tracking-wider">
                Submit tracks
              </Button>
            </Link>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            Selections
          </h1>
        </div>

        {hasDrops ? (
          <Link href="/selection/create">
            <Button variant="primary" size="lg" className="uppercase tracking-wider">
              Create selection
            </Button>
          </Link>
        ) : (
          <Link href="/drop">
            <Button variant="secondary" size="lg" className="uppercase tracking-wider">
              Submit track
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-4 text-center">
          <div className="text-xl font-bold text-foreground">
            {selections.length}
          </div>
          <div className="text-sm text-foreground/60">Active</div>
        </div>
        <div className="border border-border p-4 text-center">
          <div className="text-xl font-bold text-foreground">
            {userDrops.length}
          </div>
          <div className="text-sm text-foreground/60">Your tracks</div>
        </div>
        <div className="border border-border p-4 text-center">
          <div className="text-xl font-bold text-foreground">
            {selections.reduce((sum, b) => sum + b.totalVotes, 0)}
          </div>
          <div className="text-sm text-foreground/60">Total votes</div>
        </div>
      </div>

      {/* Active Selections */}
      {selections.length > 0 ? (
        <div>
          <h2 className="text-lg uppercase tracking-wider mb-6 text-foreground/60">
            Active selections
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selections.map((selection) => (
              <SelectionCard key={selection.id} selection={selection as any} />
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-border p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No active selections</h3>
          <p className="text-foreground/60 mb-6 text-sm">
            Submit a track to begin
          </p>
          {hasDrops ? (
            <Link href="/selection/create">
              <Button variant="primary" className="uppercase tracking-wider">
                Create selection
              </Button>
            </Link>
          ) : (
            <Link href="/drop">
              <Button variant="secondary" className="uppercase tracking-wider">
                Submit track
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
