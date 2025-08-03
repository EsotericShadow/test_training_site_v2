/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: logger.ts
 * Description: This script provides a centralized logging utility for the application.
 * It supports different log levels and can be extended to log to a file or a third-party service in production.
 *
 * Dependencies:
 * - next/server: Provides Next.js-specific server-side utilities.
 *
 * Created: 2025-07-17
 * Last Modified: 2025-07-17
 * Version: 1.0.1
 */

import { NextRequest } from 'next/server';

/**
 * @enum {string} LogLevel
 * @description Defines the different levels of logging available.
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * @interface LogMetadata
 * @description Defines the shape of the metadata that can be attached to a log entry.
 */
export interface LogMetadata {
  ip?: string;
  userId?: string | number;
  route?: string;
  [key: string]: unknown; // Allow any other metadata properties
}

/**
 * @interface LogEntry
 * @description Defines the shape of a log entry.
 */
export interface LogEntry extends LogMetadata {
  timestamp: string;
  level: LogLevel;
  message: string;
}

/**
 * @function formatLogEntry
 * @description Formats a log entry with a timestamp, level, and other metadata.
 * @param {LogLevel} level - The level of the log entry.
 * @param {string} message - The message of the log entry.
 * @param {LogMetadata} [metadata={}] - Optional metadata to include with the log entry.
 * @returns {LogEntry} The formatted log entry.
 */
function formatLogEntry(level: LogLevel, message: string, metadata: LogMetadata = {}): LogEntry {
  const timestamp = new Date().toISOString();
  const ip = metadata.ip || 'unknown';
  const userId = metadata.userId || 'anonymous';
  const route = metadata.route || 'unknown';

  return {
    timestamp,
    level,
    message,
    ip,
    userId,
    route,
    ...metadata,
  };
}

/**
 * @function writeLog
 * @description Writes a log entry to the console.
 * In a production environment, this function could be extended to write to a file or a third-party logging service.
 * @param {LogEntry} entry - The log entry to write.
 */
function writeLog(entry: LogEntry): void {
  // In production, you might want to send logs to a service like Loggly, Papertrail, etc.
  if (process.env.NODE_ENV === 'production') {
    // Production logging logic here
    console.log(JSON.stringify(entry));
  } else {
    // Development logging with colors
    const colors: { [key in LogLevel]?: string } & { reset: string } = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[90m', // Gray
      reset: '\x1b[0m',
    };

    const color = colors[entry.level] || colors.reset;
    console.log(
      `${color}[${entry.timestamp}] [${entry.level}] ${entry.message} - IP: ${entry.ip}, User: ${entry.userId}, Route: ${entry.route}${colors.reset}`
    );

    // Log additional metadata if present
    const metadataCopy: LogMetadata = { ...entry };
    delete metadataCopy.timestamp;
    delete metadataCopy.level;
    delete metadataCopy.message;
    delete metadataCopy.ip;
    delete metadataCopy.userId;
    delete metadataCopy.route;

    if (Object.keys(metadataCopy).length > 0) {
      console.log(`${color}Additional metadata:${colors.reset}`, metadataCopy);
    }
  }
}

/**
 * @constant logger
 * @description A collection of logging functions for different log levels.
 */
export const logger = {
  /**
   * @method error
   * @description Logs an error message.
   * @param {string} message - The error message to log.
   * @param {LogMetadata} [metadata={}] - Optional metadata to include with the log entry.
   * @returns {LogEntry} The formatted log entry.
   */
  error: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.ERROR, message, metadata);
    writeLog(entry);
    return entry;
  },

  /**
   * @method warn
   * @description Logs a warning message.
   * @param {string} message - The warning message to log.
   * @param {LogMetadata} [metadata={}] - Optional metadata to include with the log entry.
   * @returns {LogEntry} The formatted log entry.
   */
  warn: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.WARN, message, metadata);
    writeLog(entry);
    return entry;
  },

  /**
   * @method info
   * @description Logs an informational message.
   * @param {string} message - The informational message to log.
   * @param {LogMetadata} [metadata={}] - Optional metadata to include with the log entry.
   * @returns {LogEntry} The formatted log entry.
   */
  info: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.INFO, message, metadata);
    writeLog(entry);
    return entry;
  },

  /**
   * @method debug
   * @description Logs a debug message.
   * Debug messages are only logged in the development environment.
   * @param {string} message - The debug message to log.
   * @param {LogMetadata} [metadata={}] - Optional metadata to include with the log entry.
   * @returns {LogEntry | null} The formatted log entry, or null if not in development.
   */
  debug: (message: string, metadata: LogMetadata = {}): LogEntry | null => {
    // Only log debug messages in development
    if (process.env.NODE_ENV !== 'production') {
      const entry = formatLogEntry(LogLevel.DEBUG, message, metadata);
      writeLog(entry);
      return entry;
    }
    return null;
  },
};

/**
 * @function handleApiError
 * @description A centralized error handler for API routes.
 * This function logs the error with as much context as possible and returns a sanitized error message to the client.
 * @param {unknown} error - The error that was thrown.
 * @param {NextRequest} request - The incoming Next.js request.
 * @param {string} [defaultMessage='Internal server error'] - The default error message to return to the client.
 * @returns {{ error: string; status: number }} The sanitized error message and status code.
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  defaultMessage: string = 'Internal server error'
): { error: string; status: number } {
  // Extract IP address
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // Extract user ID if available
  let userId: string | number = 'anonymous';
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      // In a real scenario, you would decode the JWT to get the user ID.
      // This is a simplified placeholder.
      // const decoded = jwt.decode(token);
      // if (decoded && typeof decoded.sub === 'string') userId = decoded.sub;
      userId = 'authenticated_user';
    }
  } catch (e) {
    // Ignore token extraction errors and use the default userId
    console.error('Error extracting user ID:', e);
  }

  // Get route information
  const route = request.nextUrl?.pathname || 'unknown';

  // Log the error with metadata
  const errObj = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {};
  logger.error(typeof errObj.message === 'string' ? errObj.message : defaultMessage, {
    ip,
    userId,
    route,
    stack: typeof errObj.stack === 'string' ? errObj.stack : undefined,
    code: typeof errObj.code === 'string' ? errObj.code : undefined,
    name: typeof errObj.name === 'string' ? errObj.name : undefined,
  });

  // Return a sanitized error message to the client
  const clientMessage =
    process.env.NODE_ENV === 'production'
      ? defaultMessage
      : (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : defaultMessage);

  const clientStatus =
    typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
      ? error.status
      : 500;

  return {
    error: clientMessage,
    status: clientStatus,
  };
}


//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/                                       \/     \/                 