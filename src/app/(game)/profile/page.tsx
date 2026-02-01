import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPlayerStats } from "@/lib/missions";
import { getUserSelections } from "@/lib/selection";
import { getUserDrops } from "@/lib/drop";
import { ProfileView } from "./ProfileView";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [user, stats, recentSelections, drops] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        createdAt: true,
      },
    }),
    getPlayerStats(userId),
    getUserSelections(userId, 5),
    getUserDrops(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileView
      user={user}
      profile={stats.profile}
      levelProgress={stats.levelProgress}
      xpToNextLevel={stats.xpToNextLevel}
      activeMissions={stats.activeMissions}
      recentSelections={recentSelections}
      drops={drops}
    />
  );
}
