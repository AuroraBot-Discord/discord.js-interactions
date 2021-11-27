import {
  Client,
  DMChannel,
  Message,
  NewsChannel,
  Structures,
  TextChannel,
  version
} from "discord.js";
import { APIInteraction } from "discord-api-types";
import Interaction from "./classes/Interaction";

let ver: string[] | number = version.split("");
if (ver.includes('(')) {
  ver = ver.join('').split('(').pop()!.split('');
}
ver = parseInt(version[0] + version[1]);

export function init(client: Client) {
  if (ver !== 12) throw new Error("[INVALID_VERSION_PROVIDED] The discord.js version must be v12 or high");

  if (!client || !(client instanceof Client)) throw new Error("[INVALID_CLIENT_PROVIDED] The Discord.js Client isn't provided or it's invalid.");

  const message: typeof Message = Structures.get("Message");

  if (!hasProperty(message.prototype, "createMessageComponentCollector") || typeof message.prototype.createMessageComponentCollector !== "function") {
    Structures.extend('TextChannel', () => TextChannel);
    Structures.extend('DMChannel', () => DMChannel);
    Structures.extend('NewsChannel', () => NewsChannel);
    Structures.extend('Message', () => Message);
  };
  client.ws.on("INTERACTION_CREATE", (data: APIInteraction) => {
    client.emit("interactionCreate", new Interaction(client, data))
  })
}
