const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'error';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    silent: process.env.NODE_ENV === 'production',
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    silent: true,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/all.log',
    silent: true,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a simple logger interface that only logs in development
const devLogger = {
  error: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.error(message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(message, ...args);
    }
  },
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(message, ...args);
    }
  },
  http: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.http(message, ...args);
    }
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(message, ...args);
    }
  },
  // Simple log method that works like console.log
  log: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(message, ...args);
    }
  },
};

module.exports = devLogger;
