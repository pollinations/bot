import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';

export const findMissingRequiredParams = (pollen: PollenDefinition, params: Record<string, PollenParamValue>) => {
  const requiredParams = pollen.params.filter((p) => p.required);
  return requiredParams.filter((p) => params[p.name] !== 0);
};
