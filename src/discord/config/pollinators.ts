export interface Pollinator {
  url: string;
  pollenId: string;
  name?: string; // admin-friendly name
  description?: string;
}
export const POLLINATORS: Pollinator[] = [
  {
    pollenId: 'dalle-mini',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/voodoohop/dalle-playground'
  },
  {
    pollenId: 'latent-diffusion',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage'
  },
  {
    pollenId: 'majesty-diffusion',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog'
  },
  {
    pollenId: 'disco-diffusion',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/disco-diffusion'
  },
  {
    pollenId: 'retrieval-diffusion',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/latent-diffusion-400m'
  },
  {
    pollenId: 'stable-diffusion',
    url: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private'
  }
];
