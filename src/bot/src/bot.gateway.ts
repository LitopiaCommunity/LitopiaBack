import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient, Once } from "@discord-nestjs/core";
import { Client } from "discord.js";
import { UsersService } from "../../models/users/users.service";
import { CandidatureProcessService } from "../../models/candidature-process/candidature-process.service";
import { UserRole } from "../../models/users/user.entity";

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly usersService:UsersService,
    private readonly candidatureProcessService: CandidatureProcessService,
  ) {}

  @Once('ready')
  async onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
    const users = await this.usersService.getAllUsersWithRoles([UserRole.CANDIDATE])
    for (const user of users) {
      await this.candidatureProcessService.registerEmojiReactionCalback(user.candidatureDiscordMessageID,user)
    }
  }
}