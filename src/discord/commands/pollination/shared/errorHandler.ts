import type { PollenParamDefinition } from '../../../config/pollens.js';
import type { Level } from 'pino';
import type { Interaction } from 'discord.js';
export interface ExitReason {
  log?: string;
  discord?: string;
  meta?: any;
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
    } as ExitReason)
};
export const exitInteraction = async (interaction: Interaction, exitReason: ExitReason, logLevel: Level = 'info') => {
  const { meta, discord, log } = exitReason;
  const logMessage = log || discord || 'Exiting...';
  if (meta) interaction.logger[logLevel](meta, logMessage);
  else interaction.logger[logLevel](logMessage);
  if (interaction.isRepliable() && !interaction.replied)
    await interaction.reply({
      content: discord || "Sorry, this didn't work. Please try again.",
      ephemeral: true
    });
  return false;
};
