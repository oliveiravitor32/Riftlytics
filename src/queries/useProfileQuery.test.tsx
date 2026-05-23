/**
 * Sample test file for useProfileQuery hook
 * Shows testing patterns for TanStack Query hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useProfileQuery } from '@/src/queries/useProfileQuery';
import { leagueApiService } from '@/src/services/leagueApiService';

// Mock the League API service
jest.mock('@/src/services/leagueApiService');

describe('useProfileQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch profile data successfully', async () => {
    const mockSummoner = {
      id: 'test-id',
      accountId: 'test-account',
      puuid: 'test-puuid',
      name: 'TestSummoner',
      profileIconId: 0,
      summonerLevel: 30,
      revisionDate: Date.now(),
    };

    const mockLeagueEntry = {
      summonerId: 'test-id',
      summonerName: 'TestSummoner',
      queueType: 'RANKED_SOLO_5x5',
      tier: 'GOLD',
      rank: 'II',
      leaguePoints: 50,
      wins: 100,
      losses: 90,
    };

    (leagueApiService.getSummonerByName as jest.Mock).mockResolvedValue(
      mockSummoner
    );
    (leagueApiService.getLeagueEntries as jest.Mock).mockResolvedValue([
      mockLeagueEntry,
    ]);

    const { result } = renderHook(() => useProfileQuery('TestSummoner'), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      ...mockSummoner,
      rankInfo: mockLeagueEntry,
    });
  });

  it('should not fetch when summoner name is null', () => {
    const { result } = renderHook(() => useProfileQuery(null), { wrapper });

    expect(result.current.status).toBe('pending');
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Summoner not found');

    (leagueApiService.getSummonerByName as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProfileQuery('NonExistent'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});
