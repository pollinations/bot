import { pino, StreamEntry } from 'pino';

const LOGS_DIR = 'logs';

const streams: StreamEntry[] = [
  { level: 'debug', stream: process.stdout },
  { level: 'info', stream: pino.destination(`${LOGS_DIR}/combined.log`) }
];
const logger = pino(
  {
    level: process.env['PINO_LOG_LEVEL'] || 'info'
  },
  pino.multistream(streams)
);
export default logger;
