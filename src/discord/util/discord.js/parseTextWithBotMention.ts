export const parseTextWithBotMention = (messageWithMention: string) => {
  // match text that starts with <@ and ends with >, and has an optional ! in the middle
  const mentions: string[] = messageWithMention.match(/<@!?(\d+)>/g) || [];
  const firstMention = mentions[0]; // should be bot mention
  const restOfMessage = firstMention ? messageWithMention.split(firstMention).pop()!.trim() : messageWithMention.trim();

  return {
    mentions,
    restOfMessage // message without bot mention
  };
};
