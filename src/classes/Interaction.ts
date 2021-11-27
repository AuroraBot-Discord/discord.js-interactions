import Base from "./Base";
import { Client, GuildMember, Snowflake, User, Permissions, SnowflakeUtil, Guild } from "discord.js"
import { APIGuildMember, APIInteraction, InteractionType } from "discord-api-types/v9";
import { InteractionTypes, TextBasedChannels, isTextBasedChannel, CacheType, hasProperty, MessageComponentTypes } from "../Constants"

class Interaction<Cached extends CacheType = CacheType> extends Base {
  public type: InteractionType;
  public id: Snowflake;
  public readonly token: string;
  public applicationId: Snowflake;
  public channelId: Snowflake | null;
  public guildId: Snowflake | null;
  public user: User;
  public member: GuildMember | APIGuildMember | null;
  public version: number;
  public readonly memberPermissions: Permissions | null;
  constructor(client: Client, data: APIInteraction) {
    super(client);
    this.type = InteractionTypes[data.type];
    this.id = data.id;
    this.token = data.token;
    this.applicationId = data.application_id;
    this.channelId = data.channel_id ?? null;
    this.guildId = data.guild_id ?? null;
    this.user = this.client.users.add(data.user ?? data.member!.user);
    this.member = data.member ? this.guild?.members.add(data.member) ?? data.member:null;
    this.version = data.version;
    this.memberPermissions = data.member?.permissions ? new Permissions(Number(data.member.permissions)).freeze():null;
  };

  get createdTimestamp(): number {
    return SnowflakeUtil.deconstruct(this.id).timestamp;
  };
  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  };
  get channel(): Readonly<TextBasedChannels | null> {
    if (!this.channelId) return null;
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) return null;
    if (isTextBasedChannel(channel)) {
      return channel;
    } else {
      return null;
    }
  };
  get guild(): Readonly<Guild | null> {
    if (!this.guildId) return null;
    return this.client.guilds.cache.get(this.guildId) ?? null;
  };

  inGuild(): this is Interaction<"present"> & this {
    return Boolean(this.guildId && this.member);
  };
  inCachedGuild(): this is Interaction<"cached"> & this {
    return Boolean(this.guild && this.member);
  };
  inRawGuild(): this is Interaction<"raw"> & this {
    return Boolean(this.guildId && !this.guild && this.member);
  };

  isApplicationCommand(): this is BaseCommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND;
  };
  isCommand(): this is CommandInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && !hasProperty(this, "targetId");
  };
  isContextMenu(): this is ContextMenuInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND && hasProperty(this, "targetId");
  };
  isAutocomplete(): this is AutocompleteInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
  };
  isMessageComponent(): this is MessageComponentInteraction<Cached> {
    return InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT;
  };
  isButton(): this is ButtonInteraction<Cached> {
    if (!hasProperty(this, "componentType")) return false;
    return (
      InteractionTypes[this.type] === InteractionTypes.MESSAGE_COMPONENT &&
      MessageComponentTypes[this.componentType] === MessageComponentTypes.BUTTON
    );
  }
}

export default Interaction;