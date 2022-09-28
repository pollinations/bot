import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import { isPrimaryPromptParam } from './promptParamHandling.js';

export const createImplicitParamOverrides = (pollen: PollenDefinition, prompt?: string, images?: string[]) => {
  const overrides: Record<string, PollenParamValue> = {};

  const promptParam = pollen.params.find(isPrimaryPromptParam);
  if (promptParam && prompt) overrides[promptParam.name] = prompt;

  const imageParam = pollen.params.find((p) => p.type === 'image');
  if (imageParam && images && images.length > 0) overrides[imageParam.name] = images[0];

  return overrides;
};
