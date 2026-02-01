"use client";

import { cn, formatNumber } from "@/lib/utils";
import { Badge, Card, Progress } from "@/components/ui";
import type { PlayerProfile } from "@prisma/client";

interface Mission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  xpReward: number;
  pointsReward: number;
  userProgress?: {
    progress: number;
    completed: boolean;
    rewardClaimed: boolean;
  };
}

interface MissionsViewProps {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  profile: PlayerProfile | null;
  levelProgress: number;
  xpToNextLevel: number;
}

export function MissionsView({
  dailyMissions,
  weeklyMissions,
  profile,
  levelProgress,
  xpToNextLevel,
}: MissionsViewProps) {
  const completedDaily = dailyMissions.filter(
    (m) => m.userProgress?.completed
  ).length;
  const completedWeekly = weeklyMissions.filter(
    (m) => m.userProgress?.completed
  ).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">
          <span className="text-foreground">Missions</span>
        </h1>
        <p className="text-muted-foreground">
          Complete missions to earn XP and taste points
        </p>
      </div>

      {/* XP Progress */}
      <Card variant="glow" padding="lg" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Level</p>
            <p className="text-3xl font-bold">{profile?.level || 1}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="text-3xl font-bold text-foreground">
              {formatNumber(profile?.xp || 0)}
            </p>
          </div>
        </div>
        <Progress value={levelProgress * 100} variant="xp" size="lg" />
        <p className="text-center text-sm text-muted-foreground mt-2">
          {formatNumber((profile?.xp || 0) % 1000)} /{" "}
          {formatNumber(xpToNextLevel)} XP to Level {(profile?.level || 1) + 1}
        </p>
      </Card>

      {/* Daily Missions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono font-semibold uppercase tracking-[0.06em]">
            Daily Missions
          </h2>
          <Badge variant="fire">
            {completedDaily}/{dailyMissions.length} Complete
          </Badge>
        </div>

        <div className="space-y-3">
          {dailyMissions.length > 0 ? (
            dailyMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))
          ) : (
            <Card variant="elevated" padding="md" className="text-center">
              <p className="text-muted-foreground">No daily missions available</p>
            </Card>
          )}
        </div>
      </div>

      {/* Weekly Missions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono font-semibold uppercase tracking-[0.06em]">
            Weekly Missions
          </h2>
          <Badge variant="ice">
            {completedWeekly}/{weeklyMissions.length} Complete
          </Badge>
        </div>

        <div className="space-y-3">
          {weeklyMissions.length > 0 ? (
            weeklyMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))
          ) : (
            <Card variant="elevated" padding="md" className="text-center">
              <p className="text-muted-foreground">No weekly missions available</p>
            </Card>
          )}
        </div>
      </div>

      {/* Rewards Info */}
      <Card variant="elevated" padding="md" className="mt-8">
        <h3 className="font-mono font-semibold uppercase tracking-[0.06em] mb-3">
          How Missions Work
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Complete missions by playing the game naturally
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Rewards are automatically claimed when missions complete
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Daily missions reset every day at midnight
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Weekly missions reset every Monday
          </li>
        </ul>
      </Card>
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const progress = mission.userProgress?.progress || 0;
  const completed = mission.userProgress?.completed || false;
  const percent = Math.min(100, (progress / mission.targetValue) * 100);

  return (
    <Card
      variant={completed ? "glow" : "elevated"}
      padding="md"
      className={cn(
        "transition-all",
        completed && "border-neon-green/30 bg-green-500/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-md border border-white/15 flex items-center justify-center text-[10px] uppercase tracking-[0.2em]",
            completed ? "bg-green-500/10 text-green-500 border-neon-green/30" : "bg-background text-muted-foreground"
          )}
        >
          {completed ? "DONE" : "TASK"}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold">{mission.title}</h3>
            {completed && <Badge variant="victory">Complete!</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {mission.description}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress
                value={percent}
                variant={completed ? "victory" : "default"}
                size="sm"
              />
            </div>
            <span className="text-sm font-medium">
              {progress}/{mission.targetValue}
            </span>
          </div>
        </div>

        {/* Rewards */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="text-sm">+{mission.xpReward}</span>
            <span className="text-xs">XP</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <span>+{mission.pointsReward}</span>
            <span>pts</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
