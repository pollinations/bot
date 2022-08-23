import type { Pollinator } from './pollinators';

type AssetType = 'image' | 'video' | '3d'; // IPFS Media Assets

type PrimitiveType = 'text' | 'number' | 'boolean';

type PollenParam = {
  name: string;
  displayName?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | boolean | undefined;
} & (
  | { type: AssetType }
  | {
      type: 'number';
      min: number;
      max: number;
    }
  | {
      type: 'text';
      min?: number;
      max?: number;
      isPrimaryTextPrompt?: boolean;
    }
  | {
      type: 'image';
      dimensions: {
        minW?: number;
        maxW?: number;
        minH?: number;
        maxH?: number;
        minRatio?: number;
        maxRatio?: number;
      };
      allowedFormats?: string[];
    }
);
interface PollenParamValue {
  name: string;
  type: PrimitiveType | AssetType;
  value: string | number | boolean | undefined; // is ipfs contentId as string for ipfs assets
}

interface PollenOutputDescriptor {
  type: PrimitiveType | AssetType;
  description?: string;
}

export interface PollenDefinition {
  id: string;
  model: string; // name of the exact model being used
  version?: string;
  displayName: string; // user-friendly name
  params: PollenParam[]; // Set of allowed parameters for this pollen
  outputs: PollenOutputDescriptor[];
}

// a set of parameters used to run a specified pollen
export interface Pollination {
  pollen: PollenDefinition;
  pollinator: Pollinator;
  params: PollenParamValue[];
  outputId: string; // contentId
  date: number;
  user: string;
}
export const POLLENS: PollenDefinition[] = [
  {
    id: 'dalle-mini',
    model: 'dalle-mini',
    displayName: 'DALL·E Mini',
    params: [
      {
        name: 'prompt',
        type: 'text',
        required: true,
        isPrimaryTextPrompt: true
      }
    ],
    outputs: [
      {
        type: 'image'
      }
    ]
  },
  {
    id: 'latent-diffusion',
    model: 'latent-diffusion',
    displayName: 'Latent Diffusion',
    params: [
      {
        name: 'Prompt',
        type: 'text',
        isPrimaryTextPrompt: true,
        required: true
      }
    ],
    outputs: [
      {
        type: 'image'
      }
    ]
  },
  {
    id: 'majesty-diffusion',
    model: 'majesty-diffusion',

    displayName: 'Majesty Diffusion',
    params: [
      {
        name: 'Prompt',
        type: 'text',
        isPrimaryTextPrompt: true,
        required: true
      }
    ],
    outputs: [
      {
        type: 'image'
      }
    ]
  },
  {
    id: 'disco-diffusion',
    model: 'disco-diffusion',
    displayName: 'Disco Diffusion',
    params: [
      {
        name: 'prompt',
        type: 'text',
        isPrimaryTextPrompt: true,
        required: true
      }
    ],
    outputs: [
      {
        type: 'image'
      }
    ]
  }
  // {
  //   name: 'photo3d',
  //   displayName: 'Photo3D',
  //   computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi'
  // }
];
