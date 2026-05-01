import GameResumeCard from "@/src/components/game-resume-card";
import { matches } from "../data/matches";
import ProfileCard from "../components/profile-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 w-full max-w-2xl">
        <ProfileCard />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            3 jogos recentes
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <GameResumeCard
              key={`${match.champion}-${match.duration}-${match.result}`}
              match={match}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
