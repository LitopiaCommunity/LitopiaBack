import { Injectable, Logger } from "@nestjs/common";
import { InjectDiscordClient, On, Once } from "@discord-nestjs/core";
import { Client, Message, VoiceState } from "discord.js";
import { UsersService } from "../../models/users/users.service";
import { CandidatureProcessService } from "../../models/candidature-process/candidature-process.service";
import { UserEntity, UserRole } from "../../models/users/user.entity";

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);
  private readonly userVoiceJoinTimes = new Map<string, number>();

  private readonly DAY_BEFORE_RESET_ACTIVITY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private readonly MIN_VOICE_TIME_TO_BE_ACTIVE = 5 * 60 * 60; // 5 hours in seconds
  private readonly MIN_INTERACTION_TO_BE_ACTIVE = 30; // 30 interactions

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly usersService: UsersService,
    private readonly candidatureProcessService: CandidatureProcessService
  ) {
  }

  @Once("ready")
  async onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
    const users = await this.usersService.getAllUsersWithRoles([UserRole.CANDIDATE]);
    for (const user of users) {
      await this.candidatureProcessService.registerEmojiReactionCalback(user.candidatureDiscordMessageID, user);
    }
  }

  @On("messageCreate")
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    this.logger.log(`Incoming message from ${message.author.username}`);
    await this.updateUser(message.author.id);
  }

  @On("voiceStateUpdate")
  async onVoiceChanelJoin(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const user = oldState.member.user;
    if (user.bot) return;

    if (!oldState.channel && newState.channel) {
      // User joined a voice channel
      this.userVoiceJoinTimes.set(user.id, Date.now());
      this.logger.log(`User ${user.username} joined voice channel ${newState.channel.name}`);
    } else if (oldState.channel && !newState.channel) {
      // User left a voice channel
      const joinTime = this.userVoiceJoinTimes.get(user.id);
      if (joinTime) {
        const duration = (Date.now() - joinTime) / 1000; // duration in seconds
        this.userVoiceJoinTimes.delete(user.id);
        this.logger.log(`User ${user.username} left voice channel ${oldState.channel.name} after ${duration} seconds`);
        await this.updateUser(user.id, duration);
      }
    }
  }

  async updateUser(userId: string, voiceTime?: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (user !== null) {
      this.checkInactivity(user);
      if (voiceTime !== undefined) {
        this.updateVoiceTime(user, voiceTime);
      }
      this.updateInteractions(user);
      await this.usersService.update(user.discordID, user);
    }
  }

  private checkInactivity(user:UserEntity): void {
    if (user.lastActivity.getTime() < Date.now() - this.DAY_BEFORE_RESET_ACTIVITY) {
      user.lastActivity = new Date();
      user.discordNumberOfInteractions = 1;
      user.discordVoiceTime = 0;
      this.logger.log(`User ${user.discordNickname} has been inactive for more than 7 days resetting activity counter`);
    }
  }

  private updateVoiceTime(user, voiceTime: number): void {
    user.discordVoiceTime += Math.round(voiceTime);
    if (user.discordVoiceTime !== undefined && user.discordVoiceTime > this.MIN_VOICE_TIME_TO_BE_ACTIVE) {
      user.lastActivity = new Date();
      user.discordVoiceTime = 0;
      this.logger.log(`Updating activity for user ${user.discordNickname} after reaching 5 hours of voice time to be considered active`);
    }
  }

  private updateInteractions(user:UserEntity): void {
    if (user.discordNumberOfInteractions !== undefined && user.discordNumberOfInteractions < this.MIN_INTERACTION_TO_BE_ACTIVE) {
      user.discordNumberOfInteractions++;
    } else {
      user.discordNumberOfInteractions = 1;
      this.logger.log(`Updating activity for user ${user.discordNickname} after reaching the required number of interactions to be considered active`);
    }
    user.lastActivity = new Date();
  }
}
