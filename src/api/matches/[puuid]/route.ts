/**
 * API Route: GET /api/matches/[puuid]
 * Fetch match list for a player
 */

import { NextRequest, NextResponse } from 'next/server';
import { leagueApiService } from '@/src/services/leagueApiService';
import { logger } from '@/src/lib/logger';
import {
  isAppError,
  getErrorMessage,
  getErrorStatusCode,
} from '@/src/lib/errors';
import { RIOT_API_CONSTANTS } from '@/src/constants/riotApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const { puuid } = await params;

  try {
    if (!puuid || typeof puuid !== 'string') {
      logger.warn('Invalid PUUID parameter', { puuid });
      return NextResponse.json({ error: 'Invalid PUUID' }, { status: 400 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const start = Math.max(0, parseInt(searchParams.get('start') || '0', 10));
    const count = Math.min(
      RIOT_API_CONSTANTS.DEFAULTS.MATCHES_PER_PAGE,
      parseInt(
        searchParams.get('count') ||
          `${RIOT_API_CONSTANTS.DEFAULTS.MATCHES_PER_PAGE}`,
        10
      )
    );

    logger.info('Matches API: Fetching matches', { puuid, start, count });

    // Fetch match list
    const matchIds = await leagueApiService.getMatchList(
      decodeURIComponent(puuid),
      start,
      count
    );

    logger.info('Matches API: Matches fetched successfully', {
      puuid,
      count: matchIds.length,
    });

    return NextResponse.json(
      { matches: matchIds, count: matchIds.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const message = getErrorMessage(error);
    const statusCode = getErrorStatusCode(error);

    logger.error('Matches API: Error', {
      puuid,
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
