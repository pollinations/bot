import type { PollenParamDefinition } from './pollens.js';

const botTexts = {
  onExecutionStart: (prompt: string, pollenDisplayName: string) =>
    `Creating: **${prompt}** using model: **${pollenDisplayName}**`
};

export default botTexts;
