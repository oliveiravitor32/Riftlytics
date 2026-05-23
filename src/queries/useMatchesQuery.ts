/**
 * TanStack Query hook for fetching match list
 * Handles pagination and caching
 */

import { useQuery } from '@tanstack/react-query';
import { leagueApiService } from '@/src/services/leagueApiService';
import { RIOT_API_CONSTANTS } from '@/src/constants/riotApi';
import { logger } from '@/src/lib/logger';

interface UseMatchesQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  limit?: number;
}

/**
 * Hook to fetch and cache match list for a player
 */
export function useMatchesQuery(
  puuid: string | null,
  options: UseMatchesQueryOptions = {}
) {
  const {
    enabled = !!puuid,
    staleTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_LIST,
    gcTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_LIST * 2,
    limit = RIOT_API_CONSTANTS.DEFAULTS.MATCHES_PER_PAGE,
  } = options;

  return useQuery({
    queryKey: ['matches', puuid, limit],
    queryFn: async () => {
      if (!puuid) {
        throw new Error('PUUID is required');
      }

      logger.debug('useMatchesQuery: Fetching matches', { puuid, limit });

      try {
        const matchIds = await leagueApiService.getMatchList(puuid, 0, limit);
        logger.info('useMatchesQuery: Matches fetched', {
          puuid,
          count: matchIds.length,
        });
        return matchIds;
      } catch (error) {
        logger.error('useMatchesQuery: Failed to fetch matches', {
          puuid,
          error,
        });
        throw error;
      }
    },
    enabled,
    staleTime,
    gcTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

interface UseMatchDetailsQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Hook to fetch and cache match details
 */
export function useMatchDetailsQuery(
  matchId: string | null,
  options: UseMatchDetailsQueryOptions = {}
) {
  const {
    enabled = !!matchId,
    staleTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_DETAILS,
    gcTime = RIOT_API_CONSTANTS.CACHE_TTL.MATCH_DETAILS * 2,
  } = options;

  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!matchId) {
        throw new Error('Match ID is required');
      }

      logger.debug('useMatchDetailsQuery: Fetching match details', { matchId });

      try {
        const match = await leagueApiService.getMatchDetails(matchId);
        logger.info('useMatchDetailsQuery: Match details fetched', { matchId });
        return match;
      } catch (error) {
        logger.error('useMatchDetailsQuery: Failed to fetch match details', {
          matchId,
          error,
        });
        throw error;
      }
    },
    enabled,
    staleTime,
    gcTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
