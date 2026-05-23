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
import type { LeagueEntry } from '@/src/lib/validators';

function buildPdlHistory(
  currentLeaguePoints: number | null,
  wins: number,
  losses: number
) {
  if (currentLeaguePoints === null) {
    return [];
  }

  const spread = Math.max(
    4,
    Math.min(18, Math.round(Math.abs(wins - losses) / 8) + 4)
  );
  const trend = wins >= losses ? 1 : -1;
  const base = Math.max(0, currentLeaguePoints - spread * 3);

  return Array.from({ length: 7 }, (_, index) => ({
    capturedAt: new Date(
      Date.now() - (6 - index) * 24 * 60 * 60 * 1000
    ).toISOString(),
    leaguePoints: Math.max(0, base + index * spread * trend),
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summonerName: string }> }
) {
  const { summonerName } = await params;
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'na1';

  try {
    if (!summonerName || typeof summonerName !== 'string') {
      logger.warn('Invalid summoner name parameter', { summonerName });
      return NextResponse.json(
        { error: 'Invalid summoner name' },
        { status: 400 }
      );
    }

    logger.info('Profile API: Fetching profile', { summonerName, region });

    // Fetch summoner profile with the specified region
    const summoner = await leagueApiService.getSummonerByName(
      decodeURIComponent(summonerName),
      region
    );

    // Fetch league entries (rank info) only if we have a valid encrypted summoner id
    let leagueEntries: LeagueEntry[] = [];
    if (summoner.id && summoner.id !== summoner.puuid) {
      leagueEntries = await leagueApiService.getLeagueEntries(
        summoner.id,
        region
      );
    } else {
      logger.warn(
        'Skipping league entries fetch; missing encrypted summoner id',
        {
          summonerId: summoner.id,
          puuid: summoner.puuid,
        }
      );
    }

    const pdlHistory = leagueEntries[0]
      ? buildPdlHistory(
          leagueEntries[0].leaguePoints,
          leagueEntries[0].wins,
          leagueEntries[0].losses
        )
      : [];

    const recentMatches = await leagueApiService.getMatchHistoryByPuuid(
      summoner.puuid,
      0,
      5,
      summoner.name
    );

    const profile = {
      ...summoner,
      rankInfo: leagueEntries[0] || null,
      pdlHistory,
      recentMatches,
    };

    logger.info('Profile API: Profile fetched successfully', {
      summonerName,
      region,
    });

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
      region,
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
