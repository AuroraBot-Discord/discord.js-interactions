"use strict";

import { Client, Snowflake, Webhook } from "discord.js";
import ExtendedWebhook from "../structures/ExtendedWebhook";

class InteractionWebhook extends ExtendedWebhook {
  public client: Client;
  public readonly token: string;
  public id: Snowflake;
  constructor(client: Client, id: Snowflake, token: string) {
    super(client, {
      id, token, type: 3
    })
    this.client = client;
    this.id = id;
    this.token = token;
  };
};

export default InteractionWebhook;