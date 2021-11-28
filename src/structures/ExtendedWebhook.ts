"use strict";

import { MessageOptions } from "child_process";
import { WebhookClient, APIMessage, Message, Snowflake, StringResolvable, MessageAdditions, MessageEmbed, APIMessageContentResolvable, Client, Webhook } from "discord.js";
import { hasProperty } from "../Constants"

class ExtendedWebhook extends Webhook {
  async editMessage(message: Snowflake | Message, content: unknown, options?: unknown): Promise<object> {
    if (content && hasProperty(content, "embed") && (content && hasProperty(content, "embed") ? content.embed : null) instanceof MessageEmbed) {
      if (hasProperty(options, "embeds")) {
        options
          ? options.embeds && Array.isArray(options.embeds)
            ? options.embeds.push(content.embed)
            : (options.embeds = [content.embed])
          : (options = {}) && hasProperty(options, "embeds") && (options.embeds = [content.embed]);
        content = null;
      }
    }

    if (options && hasProperty(options, "embed")) {
      options = options as { embed: unknown, embeds: unknown };
      options
        ? hasProperty(options, "embeds") && options.embeds && Array.isArray(options.embeds)
          ? hasProperty(options, "embed") && options.embeds.push(options.embed)
          : hasProperty(options, "embeds") && hasProperty(options, "embed") && (options.embeds = [options.embed])
        : (options = {}) && hasProperty(options, "embeds") && hasProperty(options, "embed") &&  (options.embeds = [options.embed]);
      if (hasProperty(options, "embed")) options.embed = null;
    }

    let apiMessage: APIMessage;

    if (content instanceof APIMessage) {
      apiMessage = content.resolveData();
    } else {
      //@ts-ignore
      apiMessage = APIMessage.create(this, content, options).resolveData();
    };

    const { data, files } = await apiMessage.resolveFiles();
    
    //@ts-ignore
    return this.client.api.webhooks(this.id, this.token).messages(typeof message === "string" ? message:message.id).patch({ data, files });
  };
  async deleteMessage(message: Message | Snowflake): Promise<void> {
    //@ts-ignore
    await this.client.api.webhooks(this.id, this.token).messages(typeof message === 'string' ? message : message.id).delete();
  };
  async fetchMessage(message: Message | Snowflake): Promise<object> {
    //@ts-ignore
    const data = await this.client.api.webhooks(this.id, this.token).messages(message).get();
    return data;
  }
}

export default ExtendedWebhookClient;