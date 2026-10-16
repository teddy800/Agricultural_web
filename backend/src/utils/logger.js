// Simple logging utility

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export const logger = {
  info: (message, ...args) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${formatTimestamp()} - ${message}`, ...args);
  },
  
  success: (message, ...args) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${formatTimestamp()} - ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${formatTimestamp()} - ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${formatTimestamp()} - ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.magenta}[DEBUG]${colors.reset} ${formatTimestamp()} - ${message}`, ...args);
    }
  },
  
  request: (req) => {
    console.log(`${colors.blue}[REQUEST]${colors.reset} ${formatTimestamp()} - ${req.method} ${req.originalUrl}`);
  }
};

export function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? colors.red : colors.green;
    console.log(
      `${colors.blue}[${req.method}]${colors.reset} ${req.originalUrl} ` +
      `${statusColor}${res.statusCode}${colors.reset} - ${duration}ms`
    );
  });
  
  next();
}
