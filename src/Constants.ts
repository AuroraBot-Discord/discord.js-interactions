import { DMChannel, NewsChannel, Snowflake, TextChannel, Channel } from "discord.js";

function createEnum(keys: (string | null)[]) {
  const obj = {} as any;
  for (const [index, key] of keys.entries()) {
    if (key === null) continue;
    obj[key] = index;
    obj[index] = key;
  }
  return obj;
};

const InteractionTypes = createEnum([null, "PING", "APPLICATION_COMMAND", "MESSAGE_COMPONENT", "APPLICATION_COMMAND_AUTOCOMPLETE"]);

type TextBasedChannels = TextChannel | NewsChannel | DMChannel;

function isTextBasedChannel(channel: Channel): channel is TextBasedChannels {
  return ((channel instanceof TextChannel) || (channel instanceof NewsChannel) || (channel instanceof DMChannel));
};

type CacheType = 'cached' | 'raw' | 'present';

function hasProperty<K extends string>(
  x: unknown,
  name: K
): x is { [M in K]: unknown } {
  return x instanceof Object && name in x;
};

const MessageComponentTypes = createEnum([null, 'ACTION_ROW', 'BUTTON', 'SELECT_MENU']);

export { InteractionTypes, TextBasedChannels, isTextBasedChannel, CacheType, hasProperty, MessageComponentTypes };