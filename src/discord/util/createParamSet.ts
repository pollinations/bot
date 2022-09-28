import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';

export const createParamSet = (
  pollen: PollenDefinition,
  overrideParams: Record<string, PollenParamValue>,
  useDefaults: boolean = false
) => {
  return {
    ...(useDefaults
      ? pollen.params.reduce((acc, param) => {
          acc[param.name] = param.defaultValue;
          return acc;
        }, {} as Record<string, PollenParamValue>)
      : {}),
    ...overrideParams
  };
};
