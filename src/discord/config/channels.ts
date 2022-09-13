export interface ChannelConfig {
  model: string;
  promptField: string;
  channelId: string;
  numImages?: number;
}

export const CHANNEL_CONFIG = {
  'dalle-mini': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/voodoohop/dalle-playground',
    promptField: 'prompt',
    channelId: '999295739727466528'
  },
  'latent-diffusion': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage',
    promptField: 'Prompt',
    channelId: '999296010025173012'
  },
  'majesty-diffusion': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog',
    promptField: 'Prompt',
    channelId: '999295785621540914',
    numImages: 1
  },
  'disco-diffusion': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/disco-diffusion',
    promptField: 'prompt',
    channelId: '1003013847562592306',
    numImages: 1
  },
  photo3d: {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi',
    promptField: 'image',
    channelId: '1007030609060823082',
    numImages: 1
  },
  'retrieval-diffusion': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/latent-diffusion-400m',
    promptField: 'prompts',
    channelId: '1009168983578124449',
    numImages: 1
  },
  'stable-diffusion': {
    model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private',
    promptField: 'prompts',
    channelId: '1011335962007175198',
    numImages: 4
  }
};

export type ChannelName = keyof typeof CHANNEL_CONFIG;
