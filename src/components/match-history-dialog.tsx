'use client';

import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import GameResumeCard, { type GameResumeMatch } from './game-resume-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useMatchHistoryQuery } from '@/src/queries/useMatchHistoryQuery';

type MatchHistoryDialogProps = {
  summonerName: string;
  region: string;
  recentMatches: GameResumeMatch[];
};

export function MatchHistoryDialog({
  summonerName,
  region,
  recentMatches,
}: MatchHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  const matchHistoryQuery = useMatchHistoryQuery(summonerName, {
    enabled: open,
    region,
    start: recentMatches.length,
    pageSize: 10,
  });

  const additionalMatches =
    matchHistoryQuery.data?.pages.flatMap((page) => page.matches) ?? [];

  const isFetchingMore = matchHistoryQuery.isFetchingNextPage;
  const hasMore = Boolean(matchHistoryQuery.hasNextPage);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-full border-border bg-background text-foreground shadow-sm hover:bg-muted"
        >
          View full match history
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-hidden rounded-3xl">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>Full Match History</DialogTitle>
          <DialogDescription>
            Showing the next 10 recent matches. The card preview already
            includes the 5 most recent games.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(85vh-9rem)] space-y-4 overflow-y-auto px-6 pb-6 pt-2">
          {matchHistoryQuery.isLoading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Loading matches...
              </div>
            </div>
          ) : additionalMatches.length > 0 ? (
            <>
              {additionalMatches.map((match) => (
                <GameResumeCard
                  key={
                    match.matchId ??
                    `${match.playerName}-${match.duration}-${match.queue}`
                  }
                  match={match}
                />
              ))}

              <div className="sticky bottom-0 border-t border-border bg-background/95 pt-4 backdrop-blur-sm">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-background text-foreground shadow-sm hover:bg-muted"
                  onClick={() => matchHistoryQuery.fetchNextPage()}
                  disabled={!hasMore || isFetchingMore}
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading more
                    </>
                  ) : hasMore ? (
                    'Load More'
                  ) : (
                    'No more matches'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50 text-sm text-muted-foreground">
              No additional match history available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
