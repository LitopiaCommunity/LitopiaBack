import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { APIEmbed, Client, Message, MessageReaction, TextChannel, User } from "discord.js";

@Injectable()
export class BotUtilityService {
  private readonly logger = new Logger(BotUtilityService.name);

  constructor(@InjectDiscordClient() private readonly client: Client) {
  }

  /**
   * Send a message to the candidature channel
   * @param userId The user id
   * @param message The message
   */
  async sendPrivateMessage(userId: string, message: string) {
    const user = await this.client.users.fetch(userId);
    this.logger.log(`Sending private message to ${user.tag}`);
    if (user) {
      try {
        await user.send(message);
      } catch (e) {
        this.logger.error(e);
        this.logger.error(`Error sending private message to ${user.tag}`);
      }
    }
  }

  /**
   * Send a message to the selected channel
   * @param channelId The channel id
   * @param payload The message payload
   */
  async sendMessageToChannel(channelId: string, payload: APIEmbed | string) {
    const channel = await this.client.channels.fetch(channelId);
    if (channel.isTextBased()) {
      const textChannel = channel as TextChannel;
      this.logger.log(`Sending embed message to ${textChannel.name}`);
      try {
        if (typeof payload === "string") {
          await textChannel.send(payload);
        } else {
          return await textChannel.send({ embeds: [payload] });
        }
      } catch (e) {
        this.logger.error(e);
        this.logger.error(`Error sending embed message to ${channelId}`);
      }
    } else {
      this.logger.error(`Channel ${channelId} is not text based`);
    }
  }

  /**
   * Listen for emoji reaction on a message
   * @param message
   * @param emoji
   * @param callback (user, reaction) => void
   */
  async listenForReaction(message: Message<true>, emoji: string, callback: (reaction: MessageReaction,user:User,) => void) {
    await message.react(emoji);
    const collector = message.createReactionCollector({ dispose: true });
    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === emoji) {
        callback(reaction, user);
      }
    });
  }

}