import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';

export const findMissingRequiredParams = (pollen: PollenDefinition, params: Record<string, PollenParamValue>) => {
  const requiredParams = pollen.params.filter((p) => p.required);
  return requiredParams.filter((p) => {
    const value = params[p.name];
    return value === undefined || value === null || value === '';
  });
};
