export type AssetType = 'image' | 'video' | '3d'; // IPFS Media Assets

type PrimitiveType = 'text' | 'number' | 'boolean';

export type PollenParamDefinition = {
  name: string;
  displayName?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  xOrder?: number;
} & (
  | { type: AssetType; lastXFiles?: number; filename?: string; allowedExts?: string[] }
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
    }
);
export type PollenParamValue = string | number | boolean | undefined; // is ipfs contentId as string for ipfs assets
export interface PollenOutputDescriptor {
  type: PrimitiveType | AssetType;
  description?: string;
  lastXFiles?: number; // temporary property
  filename?: string;
}

export interface PollenDefinition {
  id: string;
  model: string; // name of the exact model being used
  version?: string;
  thumbnailUrl?: string;
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
        type: 'image',
        lastXFiles: 1
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
        type: 'image',
        lastXFiles: 1
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
        type: 'image',
        lastXFiles: 1
      }
    ]
  },
  {
    id: 'stable-diffusion',
    model: 'stable-diffusion',
    displayName: 'Stable Diffusion',
    thumbnailUrl: 'https://s4.gifyu.com/images/ezgif.com-gif-maker4faa2b37cd286f60.gif',
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
        filename: 'z_3dphoto_out.mp4'
      },
      {
        type: 'video'
      }
    ]
  },
  {
    id: 'pimped-diffusion',
    displayName: 'Pimped Diffusion',
    description: 'Pimps the prompt using GPT-3 and runs Stable Diffusion on the pimped prompts.',
    thumbnailUrl: 'https://ipfs.pollinations.ai/ipfs/QmVDhv4XjHJgH8NoXgJi1hfY87VfWdiJUxnWt5zHbhkaGW?filename=00003.png',
    model: 'pimped-diffusion',
    params: [
      {
        type: 'text',
        name: 'prompt',
        xOrder: 0,
        required: true,
        displayName: 'Prompt',
        isPrimaryTextPrompt: true
      }
    ],
    outputs: [{ type: 'image' }]
  },
  {
    id: 'photo3d',
    description: 'Turns an image into an animated 3D scene by hallucinating colors and structures',
    displayName: 'Photo3D (AdaMPI)',
    thumbnailUrl: 'https://ipfs.pollinations.ai/ipfs/QmRoS2EF2WcHqhXKmzUszw4vkGSsjXuenDcyXd9ugSVEFj',
    model: 'photo3d',
    params: [
      {
        type: 'image',
        name: 'image',
        displayName: 'Image',
        xOrder: 0,
        required: true
      }
    ],
    outputs: [
      {
        type: 'video',
        description: 'A rendered video of a generated 3D model of the input scene',
        filename: 'z_3dphoto_out.mp4'
      }
    ]
  }
];
