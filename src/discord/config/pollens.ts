type AssetType = 'image' | 'video' | '3d'; // IPFS Media Assets

type PrimitiveType = 'text' | 'number' | 'boolean';

export type PollenParamDefinition = {
  name: string;
  displayName?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  xOrder?: number;
} & (
  | { type: AssetType }
  | {
      type: 'number';
      min?: number;
      max?: number;
    }
  | {
      type: 'text';
      min?: number;
      max?: number;
      isPrimaryTextPrompt?: boolean;
    }
  | {
      type: 'boolean';
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
export type PollenParamValue = string | number | boolean | undefined; // is ipfs contentId as string for ipfs assets
interface PollenOutputDescriptor {
  type: PrimitiveType | AssetType;
  description?: string;
  numImages?: number; // temporary property
}

export interface PollenDefinition {
  id: string;
  model: string; // name of the exact model being used
  version?: string;
  displayName: string; // user-friendly name
  description?: string; // brief summary of how this pollen can be used
  params: PollenParamDefinition[]; // Set of allowed parameters for this pollen
  outputs: PollenOutputDescriptor[];
  defaultForTextPrompts?: boolean; // if true, this pollen will be used by default for text prompts
  prototype?: boolean; // Flag that I use to pick a model for testing prototypes; feel free to remove it or add your own
}

// a set of parameters used to run a specified pollen
export const POLLENS: PollenDefinition[] = [
  {
    id: 'dalle-mini',
    model: 'dalle-mini',
    displayName: 'DALL·E Mini',
    params: [
      {
        name: 'prompt',
        type: 'text',
        defaultValue: 'A giant Spaceship flying above a farmland',
        required: true,
        isPrimaryTextPrompt: true,
        xOrder: 0
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
    prototype: true,
    params: [
      {
        name: 'Prompt',
        type: 'text',
        defaultValue: 'A giant Spaceship flying above a farmland',
        isPrimaryTextPrompt: true,
        required: true,
        xOrder: 0
      },
      {
        name: 'Diversity_scale',
        defaultValue: 10,
        description:
          'As a rule of thumb, higher values of scale produce better samples at the cost of a reduced output diversity.',
        displayName: 'Diversity Scale',
        type: 'number',
        xOrder: 4
      },
      {
        name: 'ETA',
        defaultValue: 1,
        description: 'Can be 0 or 1',
        displayName: 'Eta',
        type: 'number',
        xOrder: 2
      },
      {
        name: 'Height',
        defaultValue: 256,
        description: 'Height',
        displayName: 'Height',
        type: 'number',
        xOrder: 6
      },

      {
        name: 'Samples_in_parallel',
        defaultValue: 3,
        description: 'Batch size',
        displayName: 'Samples In Parallel',
        type: 'number',
        xOrder: 3
      },
      {
        name: 'Steps',
        defaultValue: 100,
        description: 'Number of steps to run the model',
        displayName: 'Steps',
        type: 'number',
        xOrder: 1
      },
      {
        name: 'Width',
        defaultValue: 256,
        description: 'Width',
        displayName: 'Width',
        type: 'number',
        xOrder: 5
      },
      {
        name: 'Dummy_Toggle',
        description: 'A dummy boolean paramter',
        displayName: 'Dummy_Toggle',
        type: 'boolean',
        xOrder: 6
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
        defaultValue: 'A giant Spaceship flying above a farmland',
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
        defaultValue: 'A giant Spaceship flying above a farmland',
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
    id: 'retrieval-diffusion',
    model: 'retrieval-diffusion',
    displayName: 'Retrieval Diffusion',
    params: [
      {
        name: 'prompt',
        type: 'text',
        defaultValue: 'A giant Spaceship flying above a farmland',
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
    id: 'stable-diffusion',
    model: 'stable-diffusion',
    displayName: 'Stable Diffusion',
    defaultForTextPrompts: true,
    params: [
      {
        name: 'prompts',
        type: 'text',
        defaultValue: 'A giant Spaceship flying above a farmland',
        isPrimaryTextPrompt: true,
        required: true
      }
    ],
    outputs: [
      {
        type: 'image',
        numImages: 4
      },
      {
        type: 'video'
      }
    ]
  },
  {
    id: 'photo3d',
    model: 'photo3d',
    displayName: 'Photo3D',
    params: [
      {
        type: 'image',
        name: 'image'
      }
    ],
    outputs: [
      {
        type: '3d',
        description: '3D model of the scene'
      }
    ]
  }

  // {
  //   name: 'photo3d',
  //   displayName: 'Photo3D',
  //   computeUrl: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi'
  // }
];
