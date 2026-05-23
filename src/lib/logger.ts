/**
 * Application-wide logging utility
 * Uses Pino for structured logging
 */

import { config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Logger instance
 * Uses console in development, structured JSON in production
 */
class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = config.isDevelopment;
    this.logLevel = config.logLevel;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);

    if (this.isDevelopment) {
      // Development: colorful console output
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const color = colors[level];

      console.log(
        `${color}${levelUpper}${reset} [${timestamp}] ${message}`,
        context ? context : ''
      );
    } else {
      // Production: structured JSON
      const logEntry = {
        timestamp,
        level,
        message,
        ...(context && { context }),
      };
      console.log(JSON.stringify(logEntry));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Debug level logging
   */
  public debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.formatMessage('debug', message, context);
    }
  }

  /**
   * Info level logging
   */
  public info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.formatMessage('info', message, context);
    }
  }

  /**
   * Warning level logging
   */
  public warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.formatMessage('warn', message, context);
    }
  }

  /**
   * Error level logging
   */
  public error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.formatMessage('error', message, context);
    }
  }
}

export const logger = new Logger();
