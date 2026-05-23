/**
 * TanStack Query hook for fetching summoner profile
 * Handles caching and data management
 */

import { useQuery } from '@tanstack/react-query';
import { RIOT_API_CONSTANTS } from '@/src/constants/riotApi';
import { logger } from '@/src/lib/logger';

interface UseProfileQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number; // formerly cacheTime
  region?: string;
}

/**
 * Hook to fetch and cache summoner profile
 * Profile includes summoner info + rank data
 */
export function useProfileQuery(
  summonerName: string | null,
  options: UseProfileQueryOptions = {}
) {
  const {
    enabled = !!summonerName,
    staleTime = RIOT_API_CONSTANTS.CACHE_TTL.SUMMONER_PROFILE,
    gcTime = RIOT_API_CONSTANTS.CACHE_TTL.SUMMONER_PROFILE * 2,
    region = 'na1',
  } = options;

  return useQuery({
    queryKey: ['profile', summonerName, region],
    queryFn: async () => {
      if (!summonerName) {
        throw new Error('Summoner name is required');
      }

      logger.debug('useProfileQuery: Fetching profile', {
        summonerName,
        region,
      });

      try {
        // Call the Next.js API endpoint with region parameter
        const response = await fetch(
          `/api/profile/${encodeURIComponent(summonerName)}?region=${encodeURIComponent(region)}`
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            error.message || `Failed to fetch profile: ${response.status}`
          );
        }

        const profile = await response.json();

        logger.info('useProfileQuery: Profile fetched', { summonerName });
        return profile;
      } catch (error) {
        logger.error('useProfileQuery: Failed to fetch profile', {
          summonerName,
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
