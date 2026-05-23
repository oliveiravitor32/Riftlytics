/**
 * Infinite query for paginated match history pages
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { RIOT_API_CONSTANTS } from '@/src/constants/riotApi';
import { logger } from '@/src/lib/logger';
import type { GameResumeMatch } from '@/src/components/game-resume-card';

export interface MatchHistoryPage {
  matches: GameResumeMatch[];
  count: number;
  nextStart: number;
  hasMore: boolean;
}

interface UseMatchHistoryQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  pageSize?: number;
  start?: number;
  region?: string;
}

export function useMatchHistoryQuery(
  summonerName: string | null,
  options: UseMatchHistoryQueryOptions = {}
) {
  const {
    enabled = !!summonerName,
    staleTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_DETAILS,
    gcTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_DETAILS * 2,
    pageSize = 10,
    start = 5,
    region = 'na1',
  } = options;

  return useInfiniteQuery({
    queryKey: ['match-history', summonerName, region, start, pageSize],
    initialPageParam: start,
    enabled,
    staleTime,
    gcTime,
    retry: 2,
    queryFn: async ({ pageParam }) => {
      if (!summonerName) {
        throw new Error('Summoner name is required');
      }

      const response = await fetch(
        `/api/matches/${encodeURIComponent(summonerName)}?region=${encodeURIComponent(region)}&start=${pageParam}&count=${pageSize}`
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error ||
            error.message ||
            `Failed to fetch matches: ${response.status}`
        );
      }

      const data = (await response.json()) as MatchHistoryPage;

      logger.info('useMatchHistoryQuery: Page fetched', {
        summonerName,
        start: pageParam,
        count: data.count,
      });

      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextStart : undefined,
  });
}
