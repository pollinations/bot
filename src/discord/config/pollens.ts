type AssetType = 'image' | 'video' | '3d';

type PrimitiveType = 'text' | 'number' | 'boolean';

interface PollenParam {
  name: string;
  displayName?: string;
  required?: boolean;
  type: PrimitiveType | AssetType;
  isPrimaryTextPrompt?: boolean;
}

type PollenOutputType = 'text' | AssetType;

interface PollenOutput {
  type: PollenOutputType;
}

export interface PollenDefinition {
  name: string;
  displayName: string;
  params: PollenParam[];
  outputs?: PollenOutput[];
  computeUrl?: string;
}

export const POLLENS: PollenDefinition[] = [
  {
    name: 'dalle-mini',
    displayName: 'DALL·E Mini',
    computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/voodoohop/dalle-playground',
    params: [
      {
        name: 'prompt',
        type: 'text',
        required: true,
        isPrimaryTextPrompt: true
      }
    ]
  },
  {
    name: 'latent-diffusion',
    displayName: 'Latent Diffusion',
    computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage',
    params: [
      {
        name: 'Prompt',
        type: 'text',
        isPrimaryTextPrompt: true,

        required: true
      }
    ]
  },
  {
    name: 'majesty-diffusion',
    displayName: 'Majesty Diffusion',
    computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog',
    params: [
      {
        name: 'Prompt',
        type: 'text',
        isPrimaryTextPrompt: true,
        required: true
      }
    ]
  },
  {
    name: 'disco-diffusion',
    displayName: 'Disco Diffusion',
    computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/disco-diffusion',
    params: [
      {
        name: 'prompt',
        type: 'text',
        isPrimaryTextPrompt: true,
        required: true
      }
    ]
  }
  // {
  //   name: 'photo3d',
  //   displayName: 'Photo3D',
  //   computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi'
  // }
];
