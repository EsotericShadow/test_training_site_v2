// lib/logger.ts
import { NextRequest } from 'next/server';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogMetadata {
  ip?: string;
  userId?: string | number;
  route?: string;
  [key: string]: unknown; // Allow any other metadata properties
}

export interface LogEntry extends LogMetadata {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// Format a log entry with timestamp, level, and other metadata
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

// Log to console in development, could be extended to log to a file or service in production
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

// Logger functions
export const logger = {
  error: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.ERROR, message, metadata);
    writeLog(entry);
    return entry;
  },

  warn: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.WARN, message, metadata);
    writeLog(entry);
    return entry;
  },

  info: (message: string, metadata: LogMetadata = {}): LogEntry => {
    const entry = formatLogEntry(LogLevel.INFO, message, metadata);
    writeLog(entry);
    return entry;
  },

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

// Error handling utilities
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