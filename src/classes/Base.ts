import { Client } from "discord.js";

class Base {
  public client: Client;
  constructor(client: Client) {
    this.client = client;
  }
};

export default Base;