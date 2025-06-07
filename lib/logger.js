// lib/logger.js
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Format a log entry with timestamp, level, and other metadata
function formatLogEntry(level, message, metadata = {}) {
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
    ...metadata
  };
}

// Log to console in development, could be extended to log to a file or service in production
function writeLog(entry) {
  // In production, you might want to send logs to a service like Loggly, Papertrail, etc.
  if (process.env.NODE_ENV === 'production') {
    // Production logging logic here
    console.log(JSON.stringify(entry));
  } else {
    // Development logging with colors
    const colors = {
      [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
      [LOG_LEVELS.WARN]: '\x1b[33m',  // Yellow
      [LOG_LEVELS.INFO]: '\x1b[36m',  // Cyan
      [LOG_LEVELS.DEBUG]: '\x1b[90m', // Gray
      reset: '\x1b[0m'
    };
    
    const color = colors[entry.level] || colors.reset;
    console.log(`${color}[${entry.timestamp}] [${entry.level}] ${entry.message} - IP: ${entry.ip}, User: ${entry.userId}, Route: ${entry.route}${colors.reset}`);
    
    // Log additional metadata if present
    const metadataCopy = { ...entry };
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
  error: (message, metadata = {}) => {
    const entry = formatLogEntry(LOG_LEVELS.ERROR, message, metadata);
    writeLog(entry);
    return entry;
  },
  
  warn: (message, metadata = {}) => {
    const entry = formatLogEntry(LOG_LEVELS.WARN, message, metadata);
    writeLog(entry);
    return entry;
  },
  
  info: (message, metadata = {}) => {
    const entry = formatLogEntry(LOG_LEVELS.INFO, message, metadata);
    writeLog(entry);
    return entry;
  },
  
  debug: (message, metadata = {}) => {
    // Only log debug messages in development
    if (process.env.NODE_ENV !== 'production') {
      const entry = formatLogEntry(LOG_LEVELS.DEBUG, message, metadata);
      writeLog(entry);
      return entry;
    }
    return null;
  }
};

// Error handling utilities
export function handleApiError(error, request, defaultMessage = 'Internal server error') {
  // Extract IP address
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Extract user ID if available
  let userId = 'anonymous';
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      // You might want to decode the JWT to get the user ID
      // This is a simplified example
      userId = 'authenticated_user';
    }
  } catch (error) {
    // Ignore token extraction errors and use the default userId
    console.error('Error extracting user ID:', error);
  }
  
  // Get route information
  const route = request.nextUrl?.pathname || 'unknown';
  
  // Log the error with metadata
  logger.error(error.message || defaultMessage, {
    ip,
    userId,
    route,
    stack: error.stack,
    code: error.code,
    name: error.name
  });
  
  // Return a sanitized error message to the client
  // Don't expose internal error details in production
  const clientMessage = process.env.NODE_ENV === 'production' 
    ? defaultMessage 
    : (error.message || defaultMessage);
  
  return {
    error: clientMessage,
    status: error.status || 500
  };
}
