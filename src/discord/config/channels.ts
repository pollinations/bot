export interface ChannelConfig {
  pollenId: string;
  channelId?: string;
}

export const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
  'dalle-mini': {
    pollenId: 'dalle-mini',
    channelId: '999296010025173012'
  },
  'latent-diffusion': {
    pollenId: 'latent-diffusion',
    channelId: '999296010025173012'
  },
  'majesty-diffusion': {
    pollenId: 'majesty-diffusion',
    channelId: '999295785621540914'
  },
  'disco-diffusion': {
    pollenId: 'disco-diffusion',
    channelId: '1003013847562592306'
  },
  photo3d: {
    pollenId: 'photo3d',
    channelId: '1007030609060823082'
  },
  'retrieval-diffusion': {
    pollenId: 'retrieval-diffusion',
    channelId: '1009168983578124449'
  },
  'stable-diffusion': {
    pollenId: 'stable-diffusion',
    channelId: '1011335962007175198'
  },
  'pimped-diffusion': {
    pollenId: 'pimped-diffusion'
  }
};

export type ChannelName = keyof typeof CHANNEL_CONFIG;
