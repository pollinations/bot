import type { PollenParamDefinition, PollenParamValue } from '../../../config/pollens.js';
import { EXIT_REASONS } from './errorHandler.js';

export const parsePollenParamValue = (value: PollenParamValue, paramDefintion: PollenParamDefinition) => {
  let parsedValue;
  if (paramDefintion.type === 'boolean') {
    parsedValue = false;
    if (typeof value === 'boolean') {
      parsedValue = value;
    }
    if (value === 'true' || value == 1) {
      parsedValue = true;
    } else if (value === 'false' || value == 0) {
      parsedValue = false;
    } else {
      throw EXIT_REASONS.INVALID_BOOLEAN_VALUE(paramDefintion);
    }
  } else if (paramDefintion.type === 'number') {
    if (typeof value === 'number') parsedValue = value;
    else if (typeof value === 'string') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) throw EXIT_REASONS.INVALID_NUMBER_VALUE(paramDefintion);
    } else {
      throw EXIT_REASONS.INVALID_NUMBER_VALUE(paramDefintion);
    }
  } else if (paramDefintion.type === 'text') {
    parsedValue = value?.toString();
  }
  return parsedValue;
};
