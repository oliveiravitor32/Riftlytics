/**
 * Home Page
 * Displays all preset player profiles in a grid
 */

import React from 'react';
import { PRESET_SUMMONERS } from '@/src/constants/presetSummoners';
import { ProfileCard } from '@/src/components/profile-card-new';

export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="border-b border-border/70 bg-card/40 px-4 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              League analytics for friends
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
              Riftlytics
            </h1>
            <p className="text-lg leading-7 text-muted-foreground">
              League of Legends friend group analytics
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="flex gap-3 rounded-2xl border border-border bg-background/80 p-4">
              <div className="font-semibold text-foreground">01</div>
              <div>
                <p className="font-medium text-foreground">Live Profiles</p>
                <p className="text-muted-foreground">
                  Real-time rank and LP data
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-border bg-background/80 p-4">
              <div className="font-semibold text-foreground">02</div>
              <div>
                <p className="font-medium text-foreground">Quick Stats</p>
                <p className="text-muted-foreground">
                  Win rate and recent performance
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-border bg-background/80 p-4">
              <div className="font-semibold text-foreground">03</div>
              <div>
                <p className="font-medium text-foreground">Insights</p>
                <p className="text-muted-foreground">
                  Compare and analyze duos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Player Profiles
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tracking {PRESET_SUMMONERS.length} players
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_SUMMONERS.map((summoner) => (
              <ProfileCard
                key={`${summoner.gameName}#${summoner.tagLine}`}
                gameName={summoner.gameName}
                tagLine={summoner.tagLine}
                displayName={summoner.gameName}
                region={summoner.region}
                pdlHistory={summoner.pdlHistory}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            Data provided by Riot Games API
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Riftlytics is not affiliated with Riot Games
          </p>
        </div>
      </footer>
    </div>
  );
}
