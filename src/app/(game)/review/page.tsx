import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewQueue } from "./ReviewQueue";

export default async function ReviewPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/review");
  }

  // Check if user is a curator
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCurator: true },
  });

  if (!user?.isCurator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            Access Denied
          </h1>
          <p className="text-foreground/60">
            Curator access required
          </p>
        </div>
      </div>
    );
  }

  // Fetch pending submissions
  const pendingDrops = await prisma.drop.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">
          Review Queue
        </h1>
        <p className="text-foreground/60 text-sm uppercase tracking-wider">
          {pendingDrops.length} pending submission{pendingDrops.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ReviewQueue drops={pendingDrops} />
    </div>
  );
}
