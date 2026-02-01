import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveMissions, getPlayerStats } from "@/lib/missions";
import { MissionsView } from "./MissionsView";

export default async function MissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [missions, stats] = await Promise.all([
    getActiveMissions(userId),
    getPlayerStats(userId),
  ]);

  // Separate daily and weekly missions
  const dailyMissions = missions.filter(
    (m) => (m as any).frequency === "DAILY"
  );
  const weeklyMissions = missions.filter(
    (m) => (m as any).frequency === "WEEKLY"
  );

  return (
    <MissionsView
      dailyMissions={dailyMissions}
      weeklyMissions={weeklyMissions}
      profile={stats.profile}
      levelProgress={stats.levelProgress}
      xpToNextLevel={stats.xpToNextLevel}
    />
  );
}
