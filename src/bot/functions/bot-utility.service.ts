import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { Client } from "discord.js";

@Injectable()
export class BotUtilityService{
  private readonly logger = new Logger(BotUtilityService.name);

  constructor(@InjectDiscordClient() private readonly client: Client) {}

  async sendPrivateMessage(userId: string, message: string) {
    const user = await this.client.users.fetch(userId);
    this.logger.log(`Sending private message to ${user.tag}`);
    if (user) {
      try {
        await user.send(message);
      }catch (e) {
        this.logger.error(e)
        this.logger.error(`Error sending private message to ${user.tag}`);
      }
    }
  }
}