import { MessageOptions } from "child_process";
import { WebhookClient, APIMessage, Message, Snowflake, StringResolvable, MessageAdditions, MessageEmbed } from "discord.js";
import { hasProperty } from "../Constants"


class ExtendedWebhookClient extends WebhookClient {
  async editMessage(message: Snowflake | Message, content: unknown, options?: unknown): Promise<object> {
    if ((content && hasProperty(content, "embed") ? content.embed:null) instanceof MessageEmbed) {

    }
  }
}