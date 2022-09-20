import winston from 'winston';
import type { FileTransportOptions } from 'winston/lib/winston/transports/index.js';
const { combine, timestamp, printf, colorize, json } = winston.format;

const LOGS_DIR = 'logs';

// create default file transport options
const DEFAULT_TRANSPORT_OPTIONS: FileTransportOptions = {
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: combine(timestamp(), json()),
  handleExceptions: true,
  handleRejections: true,
  level: 'info'
};

const humanReadable = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const consoleFormat = combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), humanReadable);

const createDevLogger = () => {
  return winston.createLogger({
    level: 'debug',
    transports: [
      // uncomment to test file transport locally
      new winston.transports.File({
        ...DEFAULT_TRANSPORT_OPTIONS,
        filename: `${LOGS_DIR}/combined-dev.log`
      }),
      new winston.transports.Console({
        ...DEFAULT_TRANSPORT_OPTIONS,
        format: consoleFormat,
        level: 'debug'
      })
    ]
  });
};

const createProdLogger = () => {
  return winston.createLogger({
    level: 'info',
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ ...DEFAULT_TRANSPORT_OPTIONS, filename: `${LOGS_DIR}/error.log`, level: 'error' }),
      new winston.transports.File({ ...DEFAULT_TRANSPORT_OPTIONS, filename: `${LOGS_DIR}/combined.log` }),
      new winston.transports.Console({ ...DEFAULT_TRANSPORT_OPTIONS, format: consoleFormat })
    ]
  });
};

// make sure that prod logger is created even if env variable is not set
const inDev = process.env['NODE_ENV'] === 'development';
const logger = inDev ? createDevLogger() : createProdLogger();

export default logger;
