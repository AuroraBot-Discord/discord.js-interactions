"use strict";

import { APIInteraction } from "discord-api-types";
import { DiscordAPIError, MessageFlags, APIMessage, Client, Snowflake, MessageTarget, StringResolvable, MessageAdditions, Webhook, WebhookClient } from "discord.js"
import { InteractionResponseTypes, InteractionReplyOptions } from "../Constants";

class InteractionResponses {
  public id: Snowflake;
  public readonly token: string;
  public deferred: boolean;
  public replied: boolean;
  public ephemeral?: boolean;
  public client: Client;
  public webhook: WebhookClient;
  constructor(client: Client, data: APIInteraction) {
    this.id = data.id;
    this.token = data.token;
    this.deferred = false;
    this.replied = false;
    this.ephemeral = undefined;
    this.client = client;
    this.webhook = new WebhookClient(data.application_id, data.token, client.options)
  }
  async deferReply(options = {} as InteractionReplyOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    this.ephemeral = options.ephemeral ?? false;
    //@ts-ignore
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: options.ephemeral ? MessageFlags.FLAGS.EPHEMERAL : undefined,
        },
      },
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  async reply(content: StringResolvable | APIMessage, options: InteractionReplyOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    this.ephemeral = options.ephemeral ?? false;

    let messagePayload;
    if (options instanceof APIMessage) messagePayload = options;
    else messagePayload = APIMessage.create(this, content);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    //@ts-ignore
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      },
      files,
    });
    this.replied = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  fetchReply() {
    return this.webhook.fetchMessage('@original');
  }

  /**
   * Edits the initial reply to this interaction.
   * @see Webhook#editMessage
   * @param {string|MessagePayload|WebhookEditMessageOptions} options The new options for the message
   * @returns {Promise<Message|APIMessage>}
   * @example
   * // Edit the reply to this interaction
   * interaction.editReply('New content')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async editReply(options) {
    if (!this.deferred && !this.replied) throw new Error('INTERACTION_NOT_REPLIED');
    const message = await this.webhook.editMessage('@original', options);
    this.replied = true;
    return message;
  }

  /**
   * Deletes the initial reply to this interaction.
   * @see Webhook#deleteMessage
   * @returns {Promise<void>}
   * @example
   * // Delete the reply to this interaction
   * interaction.deleteReply()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deleteReply() {
    if (this.ephemeral) throw new Error('INTERACTION_EPHEMERAL_REPLIED');
    await this.webhook.deleteMessage('@original');
  }

  /**
   * Send a follow-up message to this interaction.
   * @param {string|MessagePayload|InteractionReplyOptions} options The options for the reply
   * @returns {Promise<Message|APIMessage>}
   */
  followUp(options) {
    return this.webhook.send(options);
  }

  /**
   * Defers an update to the message to which the component was attached.
   * @param {InteractionDeferUpdateOptions} [options] Options for deferring the update to this interaction
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Defer updating and reset the component's loading state
   * interaction.deferUpdate()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deferUpdate(options = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_MESSAGE_UPDATE,
      },
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  /**
   * Updates the original message of the component on which the interaction was received on.
   * @param {string|MessagePayload|InteractionUpdateOptions} options The options for the updated message
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Remove the components from the message
   * interaction.update({
   *   content: "A component interaction was received",
   *   components: []
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async update(options) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');

    let messagePayload;
    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this, options);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.UPDATE_MESSAGE,
        data,
      },
      files,
    });
    this.replied = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  static applyToClass(structure, ignore = []) {
    const props = [
      'deferReply',
      'reply',
      'fetchReply',
      'editReply',
      'deleteReply',
      'followUp',
      'deferUpdate',
      'update',
    ];

    for (const prop of props) {
      if (ignore.includes(prop)) continue;
      Object.defineProperty(
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(InteractionResponses.prototype, prop),
      );
    }
  }
}