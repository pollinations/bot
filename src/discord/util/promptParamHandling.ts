import type { PollenDefinition, PollenParam } from '../config/pollens';
export const isPrimaryPromptParam = (param: PollenParam) => param.type === 'text' && param.isPrimaryTextPrompt;
export const getPollensThatHavePromptParam = (pollens: PollenDefinition[]) =>
  pollens.filter((pollen) => pollen.params.some(isPrimaryPromptParam));
