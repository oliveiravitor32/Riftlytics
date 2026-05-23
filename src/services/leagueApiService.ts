/**
 * League of Legends API Service
 * Handles all interactions with Riot Games API
 * Singleton pattern with built-in retry logic and error handling
 */

import { config } from '@/src/lib/config';
import { logger } from '@/src/lib/logger';
import {
  RiotApiError,
  RateLimitError,
  NotFoundError,
  ExternalServiceError,
} from '@/src/lib/errors';
import {
  SummonerSchema,
  LeagueEntrySchema,
  MatchIdListSchema,
  MatchSchema,
  type Summoner,
  type LeagueEntry,
  type MatchIdList,
  type Match,
} from '@/src/lib/validators';
import { RIOT_API_CONSTANTS } from '@/src/constants/riotApi';
import { buildGameResumeMatch } from '@/src/lib/match-transformers';
import type { GameResumeMatch } from '@/src/components/game-resume-card';

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  multiplier: number;
}

/**
 * League API Service - Singleton
 */
class LeagueApiService {
  private static requestQueue: Promise<void> = Promise.resolve();
  private readonly apiKey: string;
  private readonly platformBaseUrl: string;
  private readonly regionalBaseUrl: string;
  private readonly requestTimeout: number;
  private readonly retryConfig: RetryConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    this.apiKey = config.riotApi.apiKey;
    this.platformBaseUrl = config.riotApi.platformBaseUrl;
    this.regionalBaseUrl = config.riotApi.baseUrl;
    this.requestTimeout = RIOT_API_CONSTANTS.REQUEST_TIMEOUT_MS;
    this.retryConfig = {
      maxAttempts: RIOT_API_CONSTANTS.RETRY.MAX_ATTEMPTS,
      baseDelayMs: RIOT_API_CONSTANTS.RETRY.BACKOFF_MS,
      multiplier: RIOT_API_CONSTANTS.RETRY.BACKOFF_MULTIPLIER,
    };

    // Don't throw at instantiation - API key may not be available on client side
    // Validation will happen when making actual requests
  }

  /**
   * Get summoner by name
   * Uses the Riot ID endpoint to fetch puuid first, then gets full summoner data
   */
  async getSummonerByName(
    summonerName: string,
    region = 'na1'
  ): Promise<Summoner> {
    const gameName = summonerName.split('#')[0];
    const tagLine = summonerName.split('#')[1] || '';

    const url = `${this.regionalBaseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    logger.debug('Fetching summoner by Riot ID', { summonerName, region, url });

    try {
      // First, get the PUUID using the Riot ID endpoint
      const riotIdResponse = await this.makeRequest<{
        puuid: string;
        gameName: string;
        tagLine: string;
      }>(url);

      logger.debug('Riot ID response', {
        gameName: riotIdResponse.gameName,
        tagLine: riotIdResponse.tagLine,
        puuid: riotIdResponse.puuid,
      });

      // Then, get the full summoner data using the PUUID
      let summoner;
      try {
        summoner = await this.getSummonerByPuuid(
          riotIdResponse.puuid,
          region,
          `${riotIdResponse.gameName}#${riotIdResponse.tagLine}`
        );
        // If the platform response lacks id or name, fall back to by-name lookup
        if (!summoner?.id || !summoner?.name) {
          logger.warn(
            'Summoner by-puuid missing fields, falling back to by-name',
            {
              puuid: riotIdResponse.puuid,
              gameName: riotIdResponse.gameName,
            }
          );
          throw new Error('IncompleteSummoner');
        }
      } catch {
        // Fallback: request by-name on the platform host using gameName
        const platformUrl = `https://${region}.api.riotgames.com`;
        const byNameUrl = `${platformUrl}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
          riotIdResponse.gameName
        )}`;

        logger.debug('Falling back to summoner by-name', {
          byNameUrl,
          region,
        });

        const byNameResponse =
          await this.makeRequest<Record<string, unknown>>(byNameUrl);
        try {
          summoner = SummonerSchema.parse(byNameResponse);
        } catch (zErr) {
          logger.error('Failed to validate summoner from by-name fallback', {
            byNameResponse,
            error: zErr,
          });
          throw zErr;
        }
      }

      logger.info('Summoner fetched successfully', {
        summonerName,
        puuid: summoner.puuid,
      });
      return summoner;
    } catch (error) {
      this.handleApiError(error, { summonerName, region });
    }
  }

  /**
   * Get summoner by PUUID
   */
  async getSummonerByPuuid(
    puuid: string,
    region = 'na1',
    fallbackName?: string
  ): Promise<Summoner> {
    // Map region code to platform URL
    const platformUrl = `https://${region}.api.riotgames.com`;
    const url = `${platformUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;

    logger.debug('Fetching summoner by PUUID', { puuid, region, url });

    try {
      const response = await this.makeRequest<Record<string, unknown>>(url);
      // Log raw response body for debugging when schema validation fails
      try {
        logger.debug('Raw summoner-by-puuid response body', {
          puuid,
          body: JSON.stringify(response),
        });
      } catch {
        logger.debug('Raw summoner-by-puuid response (non-serializable)', {
          puuid,
        });
      }
      try {
        const validated = SummonerSchema.parse(response);
        logger.info('Summoner fetched successfully', { puuid });
        return validated;
      } catch (zErr) {
        // If the platform returns a reduced object (missing id/accountId/name),
        // construct a best-effort Summoner object using available fields and fallbacks.
        logger.warn(
          'Summoner by-puuid missing fields; constructing fallback object',
          {
            puuid,
            error: zErr,
          }
        );

        const fallback: Summoner = {
          id:
            typeof response.id === 'string'
              ? response.id
              : typeof response.puuid === 'string'
                ? response.puuid
                : puuid,
          accountId:
            typeof response.accountId === 'string'
              ? response.accountId
              : typeof response.puuid === 'string'
                ? response.puuid
                : puuid,
          puuid: typeof response.puuid === 'string' ? response.puuid : puuid,
          name:
            typeof response.name === 'string'
              ? response.name
              : (fallbackName ?? `${puuid.substring(0, 8)}`),
          profileIconId:
            typeof response.profileIconId === 'number'
              ? response.profileIconId
              : 0,
          summonerLevel:
            typeof response.summonerLevel === 'number'
              ? response.summonerLevel
              : 0,
          revisionDate:
            typeof response.revisionDate === 'number'
              ? response.revisionDate
              : Date.now(),
        };

        // Validate the constructed object against the schema to ensure types
        const validatedFallback = SummonerSchema.parse(fallback);
        logger.info('Returning fallback summoner object', { puuid });
        return validatedFallback;
      }
    } catch (error) {
      this.handleApiError(error, { puuid, region });
    }
  }

  /**
   * Get league entries (rank information) for a summoner
   */
  async getLeagueEntries(
    summonerId: string,
    region = 'na1'
  ): Promise<LeagueEntry[]> {
    // Map region code to platform URL
    const platformUrl = `https://${region}.api.riotgames.com`;
    const url = `${platformUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;

    logger.debug('Fetching league entries', { summonerId, region, url });

    try {
      const response = await this.makeRequest<unknown>(url);
      const validated = Array.isArray(response)
        ? response
            .filter(
              (entry): entry is Record<string, unknown> =>
                entry != null &&
                typeof entry === 'object' &&
                (entry as Record<string, unknown>).queueType ===
                  RIOT_API_CONSTANTS.QUEUE_TYPES.SOLO_DUO
            )
            .map((entry) => LeagueEntrySchema.parse(entry))
        : [];

      logger.info('League entries fetched', {
        summonerId,
        count: validated.length,
      });
      return validated;
    } catch (error) {
      this.handleApiError(error, { summonerId, region });
    }
  }

  /**
   * Get match list for a player
   */
  async getMatchList(
    puuid: string,
    start = 0,
    count: number = RIOT_API_CONSTANTS.DEFAULTS.MATCHES_PER_PAGE
  ): Promise<MatchIdList> {
    const url = `${this.regionalBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;

    logger.debug('Fetching match list', { puuid, start, count });

    try {
      const response = await this.makeRequest<unknown>(url);
      const validated = MatchIdListSchema.parse(response);

      logger.info('Match list fetched', { puuid, count: validated.length });
      return validated;
    } catch (error) {
      this.handleApiError(error, { puuid, start, count });
    }
  }

  /**
   * Get match details
   */
  async getMatchDetails(matchId: string): Promise<Match> {
    const url = `${this.regionalBaseUrl}/lol/match/v5/matches/${matchId}`;

    logger.debug('Fetching match details', { matchId });

    try {
      const response = await this.makeRequest<unknown>(url);
      const validated = MatchSchema.parse(response);

      logger.info('Match details fetched', { matchId });
      return validated;
    } catch (error) {
      this.handleApiError(error, { matchId });
    }
  }

  /**
   * Get transformed match history for display
   */
  async getMatchHistoryByPuuid(
    puuid: string,
    start: number = 0,
    count: number = RIOT_API_CONSTANTS.DEFAULTS.MATCHES_PER_PAGE,
    fallbackPlayerName?: string
  ): Promise<GameResumeMatch[]> {
    const matchIds = await this.getMatchList(puuid, start, count);
    const matches: Match[] = [];

    for (const matchId of matchIds) {
      matches.push(await this.getMatchDetails(matchId));
    }

    return matches.map((match) =>
      buildGameResumeMatch(match, puuid, fallbackPlayerName)
    );
  }

  /**
   * Make HTTP request with retry logic and rate limit handling
   */
  private async makeRequest<T>(url: string, attempt: number = 1): Promise<T> {
    return this.runWithQueue(async () => {
      try {
        // Validate API key is available
        if (!this.apiKey) {
          throw new RiotApiError(
            'RIOT_API_KEY environment variable is not set',
            500,
            { url, attempt }
          );
        }

        // Rate limiting check
        await this.checkRateLimit();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Riot-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.requestTimeout),
        });

        this.requestCount++;
        this.lastRequestTime = Date.now();

        // Check rate limit headers
        const rateLimitHeaders = this.extractRateLimitInfo(response.headers);
        logger.debug('API request completed', {
          status: response.status,
          rateLimitHeaders,
        });

        if (!response.ok) {
          return this.handleResponseError(response, url);
        }

        return (await response.json()) as T;
      } catch (error) {
        // Retry logic for transient errors
        if (
          attempt < this.retryConfig.maxAttempts &&
          this.isRetriableError(error)
        ) {
          const delayMs =
            this.retryConfig.baseDelayMs *
            Math.pow(this.retryConfig.multiplier, attempt - 1);

          logger.warn('Retrying request', {
            attempt,
            delayMs,
            url,
          });

          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return this.makeRequest<T>(url, attempt + 1);
        }

        throw error;
      }
    });
  }

  private async runWithQueue<T>(task: () => Promise<T>): Promise<T> {
    const previous = LeagueApiService.requestQueue;
    let release!: () => void;

    LeagueApiService.requestQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    try {
      await previous;
      return await task();
    } finally {
      release();
    }
  }

  /**
   * Check if we're approaching rate limit
   */
  private async checkRateLimit(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const minTimeBetweenRequests =
      (1000 / RIOT_API_CONSTANTS.RATE_LIMIT_REQUESTS_PER_SECOND) * 1.1; // 10% buffer

    if (timeSinceLastRequest < minTimeBetweenRequests) {
      const delayMs = minTimeBetweenRequests - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  /**
   * Extract rate limit info from response headers
   */
  private extractRateLimitInfo(headers: Headers): Record<string, string> {
    return {
      limitCount: headers.get('X-RateLimit-Count') || 'unknown',
      limitLimit: headers.get('X-RateLimit-Limit') || 'unknown',
      limitReset: headers.get('X-RateLimit-Reset') || 'unknown',
    };
  }

  /**
   * Handle error responses from API
   */
  private handleResponseError<T>(response: Response, url: string): T {
    const statusCode = response.status;
    const context = { statusCode, url, requestCount: this.requestCount };

    logger.error('API error response', context);

    if (statusCode === 404) {
      throw new NotFoundError('Summoner', context);
    }

    if (statusCode === 429) {
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '60',
        10
      );
      throw new RateLimitError(retryAfter);
    }

    if (statusCode >= 500) {
      throw new ExternalServiceError(
        'Riot API',
        `Server error (${statusCode})`,
        context
      );
    }

    throw new RiotApiError(`API error: ${statusCode}`, statusCode, context);
  }

  /**
   * Determine if error should be retried
   */
  private isRetriableError(error: unknown): boolean {
    if (error instanceof RateLimitError) return true;
    if (error instanceof ExternalServiceError) return true;
    if (error instanceof Error && error.name === 'AbortError') return true;

    return false;
  }

  /**
   * Handle API errors with logging
   */
  private handleApiError(
    error: unknown,
    context: Record<string, unknown>
  ): never {
    logger.error('League API error', { ...context, error });
    throw error;
  }
}

// Export singleton instance
export const leagueApiService = new LeagueApiService();

export type { Summoner, LeagueEntry, Match, MatchIdList };
