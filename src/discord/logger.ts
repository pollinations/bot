import { Level, pino, StreamEntry } from 'pino';
const LOGS_DIR = 'logs';
const devStreams: StreamEntry[] = [
  { level: 'debug', stream: process.stdout },
  { level: 'info', stream: pino.destination(`${LOGS_DIR}/combined.log`) },
  { level: 'error', stream: pino.destination(`${LOGS_DIR}/error.log`) }
];
const prodStreams: StreamEntry[] = [
  { level: (process.env['PINO_LOG_LEVEL'] as Level) || 'info', stream: process.stdout },
  { level: 'error', stream: process.stderr }
];
const inDev = process.env['NODE_ENV'] === 'development';
const logger = pino(
  {
    level: process.env['PINO_LOG_LEVEL'] || 'info'
  },
  pino.multistream(inDev ? devStreams : prodStreams)
);
export default logger;
