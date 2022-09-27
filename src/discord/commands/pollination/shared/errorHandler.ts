import type { PollenParamDefinition } from '../../../config/pollens.js';
import type { Level } from 'pino';
import type { Interaction, Message } from 'discord.js';
import { forceReplyToInteraction } from '../../../util/forceReplyTo.js';
export interface ExitReason {
  log?: string;
  discord?: string;
  meta?: any;
  level?: Level;
}

export const EXIT_REASONS = {
  NO_SESSION: () =>
    ({
      discord: `No session has been initialized. Use \`/init\` command to start session`,
      log: 'No active session. Exiting...'
    } as ExitReason),
  INVALID_PARAM_KEY: (key: string) =>
    ({
      discord: `No parameter with name \`${key}\``,
      log: `No parameter with name ${key}. Exiting...`
    } as ExitReason),
  SERVER_ERROR: () =>
    ({
      discord: `There was an error while executing this command!`
    } as ExitReason),
  INVALID_POLLEN_ID: (pollenId: string) =>
    ({
      log: `Invalid pollen id: ${pollenId}`,
      discord: `'${pollenId} is not a valid pollen id`,
      level: 'warn'
    } as ExitReason),

  INVALID_BOOLEAN_VALUE: (param: PollenParamDefinition) =>
    ({
      discord: `${param.name} is a boolean parameter. Please use either of [true, false, 1, 0] or use toggle command.`
    } as ExitReason),
  INVALID_NUMBER_VALUE: (param: PollenParamDefinition) =>
    ({
      discord: `${param.name} is a numeric parameter. Please provide a number.`
    } as ExitReason),
  INVALID_COMMAND: (commandName: string) => ({
    log: `Invalid command name: ${commandName}`
  }),
  INVALID_SUB_COMMAND: (subCommandName: string) => ({
    log: `Invalid sub command name: ${subCommandName}`
  }),
  UNEXPECTED_EXCEPTION: (error: unknown, message?: string) =>
    ({
      log: message || `Unexpected exception: ${error}`,
      meta: error
    } as ExitReason),
  PROMPT_PARAM_NOT_FOUND: (pollenId: string) =>
    ({
      log: `Pollen ${pollenId} does not have a primary prompt param`,
      discord: `Pollen ${pollenId} does not have a primary prompt param`,
      level: 'warn'
    } as ExitReason)
};
const logExit = (interaction: Interaction | Message, exitReason: ExitReason, logLevel?: Level) => {
  const { meta, discord, log, level } = exitReason;

  // log
  const logMessage = log || discord || 'Exiting...';
  const logLevelToUse = logLevel || level || 'info';
  if (meta) interaction.logger[logLevelToUse](meta, logMessage);
  else interaction.logger[logLevelToUse](logMessage);
};
export const exitInteraction = async (interaction: Interaction, exitReason: ExitReason, logLevel?: Level) => {
  logExit(interaction, exitReason, logLevel);

  // reply in discord
  const content = exitReason.discord || "Sorry, this didn't work. Please try again.";
  return forceReplyToInteraction(interaction, content);
};
export const exitMessage = async (interaction: Interaction | Message, exitReason: ExitReason, logLevel?: Level) => {
  logExit(interaction, exitReason, logLevel);
};
