import type { PollenParamDefinition } from './pollens.js';

const botTexts = {
  onExecutionStart: (prompt: string, pollenDisplayName: string) =>
    `Creating: **${prompt}** using model: **${pollenDisplayName}**`
};

export const ERROR_MESSAGES = {
  NO_SESSION: () => `No session has been started. Use \`/init\` command to start session`,
  INVALID_BOOLEAN_VALUE: (param: PollenParamDefinition) =>
    `${param.name} is a boolean parameter. Please use either of [true, false, 1, 0] or use toggle command.`,
  INVALID_NUMBER_VALUE: (param: PollenParamDefinition) =>
    `${param.name} is a numeric parameter. Please provide a number.`
};

export default botTexts;
