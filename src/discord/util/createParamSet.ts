import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import { isPrimaryPromptParam } from './promptParamHandling.js';

export const createParamSet = (pollen: PollenDefinition, prompt: string, useDefaults: boolean = false) => {
  const promptParam = pollen.params.find(isPrimaryPromptParam);
  if (!promptParam) throw new Error('Pollen does not have a primary prompt param');

  const params = useDefaults
    ? pollen.params.reduce((acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      }, {} as Record<string, PollenParamValue>)
    : {};

  params[promptParam.name] = prompt;
  return params;
};
