/**
 * ProfileCard Component
 * Displays a player's profile with rank, stats, and champions
 */

'use client';

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useProfileQuery } from '@/src/queries/useProfileQuery';
import { RankBadge } from './rank-badge';
import { StatItem } from './stat-item';
import { WinRateBar } from './win-rate-bar';
import { Card } from './ui/card';
import GameResumeCard, { type GameResumeMatch } from './game-resume-card';
import { MatchHistoryDialog } from './match-history-dialog';

interface ProfileCardProps {
  gameName: string;
  tagLine: string;
  displayName: string;
  region?: string;
  pdlHistory?: PdlHistoryPoint[];
}

type PdlHistoryPoint = {
  capturedAt: string;
  leaguePoints: number;
};

function formatChartLabel(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ProfileCard({
  gameName,
  tagLine,
  displayName,
  region = 'na1',
  pdlHistory: presetPdlHistory = [],
}: ProfileCardProps): React.ReactElement {
  // Construct the full summoner ID (gameName#tagLine)
  const summonerId = `${gameName}#${tagLine}`;
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useProfileQuery(summonerId, { region });

  if (isLoading) {
    return (
      <Card className="border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            <p className="text-muted-foreground">Loading {displayName}...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="h-8 w-8 text-foreground" />
          <div className="text-center">
            <p className="font-semibold text-foreground">
              Failed to load profile
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">No profile data</p>
      </Card>
    );
  }

  const rankInfo = profile.rankInfo;
  const pdlHistory: PdlHistoryPoint[] =
    profile.pdlHistory && profile.pdlHistory.length > 0
      ? profile.pdlHistory
      : presetPdlHistory;
  const recentMatches: GameResumeMatch[] = profile.recentMatches || [];
  const winRate = rankInfo
    ? (rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100
    : 0;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
        {/* Header with summoner name */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {profile.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Level {profile.summonerLevel}
              </p>
            </div>
            {rankInfo && (
              <RankBadge
                tier={rankInfo.tier}
                rank={rankInfo.rank}
                leaguePoints={rankInfo.leaguePoints}
              />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6 p-6">
          {rankInfo ? (
            <>
              <WinRateBar wins={rankInfo.wins} losses={rankInfo.losses} />

              <div className="grid grid-cols-2 gap-6">
                <StatItem label="Wins" value={rankInfo.wins} highlight />
                <StatItem label="Losses" value={rankInfo.losses} />
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
                <StatItem
                  label="Win Rate"
                  value={winRate.toFixed(1)}
                  unit="%"
                  highlight
                />
                <StatItem
                  label="Record"
                  value={`${rankInfo.wins} - ${rankInfo.losses}`}
                />
              </div>
            </>
          ) : (
            <div className="py-2 text-center">
              <p className="text-muted-foreground">
                Not yet ranked in Solo/Duo
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  PDL History
                </p>
                <p className="text-xs text-muted-foreground">
                  LP trend from stored snapshots
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {pdlHistory.length} pts
              </span>
            </div>

            <div className="min-h-44 w-full">
              {pdlHistory.length > 1 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={176}
                >
                  <LineChart data={pdlHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="capturedAt"
                      tickFormatter={formatChartLabel}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      minTickGap={18}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        color: 'var(--foreground)',
                      }}
                      labelFormatter={(label) =>
                        formatChartLabel(String(label))
                      }
                      formatter={(value) => [`${value} LP`, 'League Points']}
                    />
                    <Line
                      type="monotone"
                      dataKey="leaguePoints"
                      stroke="var(--foreground)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: 'var(--foreground)', strokeWidth: 0 }}
                      activeDot={{
                        r: 5,
                        fill: 'var(--background)',
                        stroke: 'var(--foreground)',
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Not enough PDL snapshots yet
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Recent Matches
                </p>
                <p className="text-xs text-muted-foreground">
                  The five most recent full match cards
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {recentMatches.length} shown
              </span>
            </div>

            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.slice(0, 5).map((match) => (
                  <GameResumeCard
                    key={
                      match.matchId ??
                      `${match.playerName}-${match.duration}-${match.queue}`
                    }
                    match={match}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                No recent match history available yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Last updated just now
          </p>
        </div>
      </Card>

      {recentMatches.length > 0 && (
        <div className="px-1 pb-2">
          <MatchHistoryDialog
            summonerName={summonerId}
            region={region}
            recentMatches={recentMatches.slice(0, 5)}
          />
        </div>
      )}
    </div>
  );
}
