import type { PollenDefinition, PollenParamDefinition } from '../config/pollens.js';
export const isPrimaryPromptParam = (param: PollenParamDefinition) =>
  param.type === 'text' && param.isPrimaryTextPrompt;
export const getPollensThatHavePromptParam = (pollens: PollenDefinition[]) =>
  pollens.filter((pollen) => pollen.params.some(isPrimaryPromptParam));
