import type { PollenDefinition } from '../config/pollens';

export const getPollensThatHavePromptParam = (pollens: PollenDefinition[]) =>
  pollens.filter((pollen) => pollen.params.some((param) => param.isPrimaryTextPrompt));
