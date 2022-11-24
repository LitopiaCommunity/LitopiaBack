import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Client, Message, VoiceState } from "discord.js";
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

  @On('messageCreate')
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot)return;
    this.logger.log(`Incoming message from ${message.author.username}`);
    await this.updateUser(message.author.id)
  }

  @On('voiceStateUpdate')
  async onVoiceChanelJoin(oldState:VoiceState, _newState:VoiceState){
    if (oldState.member.user.bot) return;
    this.logger.log(`Voice connexion from ${oldState.member.user.username}`);
    await this.updateUser(oldState.member.user.id)
  }

  async updateUser(userId) {
    const user = await this.usersService.findOne(userId);
    if (user !== null) {
      user.lastActivity = new Date();
      await this.usersService.update(user.discordID, user);
    }
  }

}