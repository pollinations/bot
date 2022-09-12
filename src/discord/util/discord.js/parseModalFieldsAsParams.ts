import type { ModalSubmitInteraction } from 'discord.js';
import type { PollenParam, PollenParamValue } from '../../config/pollens';

export const parseModalFieldsAsParams = (submitted: ModalSubmitInteraction, availableParams: PollenParam[]) => {
  return submitted.fields.fields.reduce((curr, input) => {
    const config = availableParams.find((p) => p.name === input.customId)!;
    const value = parseInputParamString(config, input.value);
    curr[input.customId] = value;
    return curr;
  }, {} as Record<string, PollenParamValue>);
};

const parseInputParamString = (param: PollenParam, value: string): PollenParamValue => {
  switch (param.type) {
    case 'number':
      return parseFloat(value);
    case 'text':
      return value;
    default:
      throw new Error(`Unsupported param type: ${param.type}`);
  }
};
