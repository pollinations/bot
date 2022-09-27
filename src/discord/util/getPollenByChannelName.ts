import { CHANNEL_CONFIG } from '../config/channels.js';
import { POLLENS } from '../config/pollens.js';

export const getPollenFromChannelName = (channelName: string) => {
  const channelConfig = CHANNEL_CONFIG[channelName];
  return channelConfig && POLLENS.find((p) => p.id === channelConfig.pollenId);
};
