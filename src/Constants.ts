"use strict";

import { DMChannel, NewsChannel, Snowflake, TextChannel, Channel, MessageOptions } from "discord.js";

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

type InteractionReplyOptions = MessageOptions & {
  ephemeral?: boolean;
  fetchReply: boolean;
};

const MessageComponentTypes = createEnum([null, 'ACTION_ROW', 'BUTTON', 'SELECT_MENU']);

const InteractionResponseTypes = createEnum([
  null,
  'PONG',
  null,
  null,
  'CHANNEL_MESSAGE_WITH_SOURCE',
  'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE',
  'DEFERRED_MESSAGE_UPDATE',
  'UPDATE_MESSAGE',
  'APPLICATION_COMMAND_AUTOCOMPLETE_RESULT',
]);

export { InteractionTypes, TextBasedChannels, isTextBasedChannel, CacheType, hasProperty, MessageComponentTypes, InteractionResponseTypes, InteractionReplyOptions };