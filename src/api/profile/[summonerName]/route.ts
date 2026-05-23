/**
 * API Route: GET /api/profile/[summonerName]
 * Fetch summoner profile data from Riot API
 */

import { NextRequest, NextResponse } from 'next/server';
import { leagueApiService } from '@/src/services/leagueApiService';
import { logger } from '@/src/lib/logger';
import {
  isAppError,
  getErrorMessage,
  getErrorStatusCode,
} from '@/src/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summonerName: string }> }
) {
  const { summonerName } = await params;

  try {
    if (!summonerName || typeof summonerName !== 'string') {
      logger.warn('Invalid summoner name parameter', { summonerName });
      return NextResponse.json(
        { error: 'Invalid summoner name' },
        { status: 400 }
      );
    }

    logger.info('Profile API: Fetching profile', { summonerName });

    // Fetch summoner profile
    const summoner = await leagueApiService.getSummonerByName(
      decodeURIComponent(summonerName)
    );

    // Fetch league entries (rank info)
    const leagueEntries = await leagueApiService.getLeagueEntries(summoner.id);

    const profile = {
      ...summoner,
      rankInfo: leagueEntries[0] || null,
    };

    logger.info('Profile API: Profile fetched successfully', { summonerName });

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);
    const statusCode = getErrorStatusCode(error);

    logger.error('Profile API: Error', {
      summonerName,
      error: message,
      statusCode,
    });

    return NextResponse.json(
      {
        error: message,
        ...(isAppError(error) && { context: error.context }),
      },
      { status: statusCode }
    );
  }
}
