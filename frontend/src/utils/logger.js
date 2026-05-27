// Simple frontend logger that respects environment
const isDevelopment = process.env.NODE_ENV !== 'production';

const frontendLogger = {
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  },
  log: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  }
};

export default frontendLogger;
