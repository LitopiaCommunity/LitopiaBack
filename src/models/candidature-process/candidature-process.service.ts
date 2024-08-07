import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { UserEntity, UserRole } from "../users/user.entity";
import { CandidaturePostDto } from "./dto/candidature-post.dto";
import { MinecraftApiService } from "../../api/minecraft-api/minecraft-api.service";
import { CandidatureError } from "./candidature.data";
import { MinecraftUsersService } from "../minecraft-users/minecraft-users.service";
import { UsersService } from "../users/users.service";
import { DeepPartial } from "typeorm";
import { MinecraftUserEntity } from "../minecraft-users/minecraft-user.entity";
import { BotUtilityService } from "../../bot/utils/bot-utility.service";
import { APIEmbed, Message, MessageReaction, User } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { UsersVotesService } from "../users-votes/users-votes.service";
import { VoteType } from "../users-votes/user-vote.entity";
import { UserVoteErrorEnum, UserVoteException } from "../users-votes/user-vote.exception";
import { CandidatureProcessErrorEnum, CandidatureProcessException } from "./candidature-process.exception";

@Injectable()
export class CandidatureProcessService {
  private readonly logger = new Logger(CandidatureProcessService.name);
  private DISCORD_CANDIDATURE_CHANNEL_ID = this.configService.get<string>("DISCORD_CANDIDATURE_CHANNEL_ID");
  private static readonly VOTE_EMOJI = ["👍", "👎", "🤷"];

  constructor(
    private mcAPIService: MinecraftApiService,
    private mcUserService: MinecraftUsersService,
    private userService: UsersService,
    private botUtilityService: BotUtilityService,
    private usersVotesService: UsersVotesService,
    private configService: ConfigService
  ) {
  }

  /**
   * Create a candidature for a user
   * This method will return a CandidatureError if :
   * - the user is already create a candidature or have candidate
   * - minecraft user already used by another user
   * - the provided uuid is not valid
   * @param user The authenticated user who want to create a candidature
   * @param candidature The candidature data for inscription
   */
  async postCandidature(user: UserEntity, candidature: CandidaturePostDto): Promise<CandidatureError | UserEntity> {
    // Check if the user is already have a candidature
    if (user.role !== UserRole.GHOST) {
      return { code: HttpStatus.BAD_REQUEST, message: "You can not candidate if you already have been candidate" };
    }

    // Check if the user is in the minecraft server
    if (await this.mcUserService.isMcUserExist(candidature.minecraftUUID)) {
      return { code: HttpStatus.BAD_REQUEST, message: "This minecraft user is already used" };
    }

    // Check if the provided minecraft uuid is valid
    const profile = await this.mcAPIService.getMcProfileFromUUID(candidature.minecraftUUID);
    if (!profile) {
      return { code: HttpStatus.BAD_REQUEST, message: "The provided minecraft UUID is not found" };
    }

    // Create a reference to user
    let newUser: DeepPartial<UserEntity> = null;

    const minecraftUser: DeepPartial<MinecraftUserEntity> = {
      minecraftUUID: profile.id,
      minecraftNickname: profile.name,
      user: newUser
    };

    // create new minecraft user if not exist
    const newMcUser = await this.mcUserService.createUser(minecraftUser);

    newUser = {
      ...user,
      candidature: candidature.candidature,
      candidatureProposalAt: new Date(),
      minecraftUser: newMcUser,
      role: UserRole.CANDIDATE
    };

    this.sendMessageToUser(newUser.discordID)
      .then(() => this.logger.log("Confirmation candidature message send to " + newUser.discordNickname))
      .catch(e => this.logger.error("Error while trying to send confirmation " + newUser.discordNickname + " with error :" + e));

    const createdUser = await this.userService.create(newUser);

    const message = await this.sendCandidatureToChannel(createdUser);

    if (message) {
      createdUser.candidatureDiscordMessageID = message.id;
      await this.userService.update(createdUser.discordID, createdUser);
    }

    // update the user role in discord
    await this.userService.updateRole(createdUser, UserRole.CANDIDATE);

    this.logger.log("Candidature created for " + createdUser.discordNickname);

    return createdUser;
  }

  /**
   * Send a message to the user to inform him that his candidature is accepted
   * @param discordID The discord id of the user
   */
  async sendMessageToUser(discordID: string) {
    await this.botUtilityService.sendPrivateMessage(discordID, "**⏳ Ta candidature a bien était poster sur notre discord #candidatures.**" +
      "Il ne te reste plus qu'a attendre les votes des litopien\n" +
      "Tu sera prochainement recontacter par l'un de nos modérateur.");
  }

  /**
   * Send candidature to discord channel add reaction and listen to reaction for vote
   * @param user The user who have a candidature
   */
  async sendCandidatureToChannel(user: UserEntity) {
    this.logger.log("Send candidature to channel for " + user.discordNickname);
    const embed = await this.createEmbed(user);
    const message = await this.botUtilityService.sendMessageToChannel(this.DISCORD_CANDIDATURE_CHANNEL_ID, embed);
    if (message) {
      await this.registerEmojiReactionCalback(message.id, user);
    }
    return message;
  }

  /**
   * Register Emoji reaction for candidature
   * @Param messageID The message of the candidature
   * @Param user The user who have a candidature
   */
  async registerEmojiReactionCalback(messageID: string, user: UserEntity) {
    this.logger.log("Register emoji reaction for " + user.discordNickname);
    try {
      const message = await this.botUtilityService.getMessagesFromId(this.DISCORD_CANDIDATURE_CHANNEL_ID, messageID);
      for (const emoji of CandidatureProcessService.VOTE_EMOJI) {
        await this.botUtilityService.listenForReaction(message, emoji, this.candidatureVoteCallback(user, message));
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error(`Error listening for reaction on message ${messageID}`);
    }
  }


  /**
   * Create an embed for candidature
   * @param user the candidature user we want to post embed on discord
   */
  async createEmbed(user: UserEntity) {
    const requiredVotes = this.usersVotesService.getRequiredNumberOfVotes();
    const nbLikeVotes = this.usersVotesService.getNumberOfSelectedVotes(user, VoteType.FOR);
    const nbDislikeVotes = this.usersVotesService.getNumberOfSelectedVotes(user, VoteType.AGAINST);
    const nbNeutralVotes = this.usersVotesService.getNumberOfSelectedVotes(user, VoteType.ABSTENTION);
    const hasPositiveRatio = this.usersVotesService.hasPositiveRatio(user);

    const promiseResolve = await Promise.all([hasPositiveRatio, requiredVotes, nbLikeVotes, nbDislikeVotes, nbNeutralVotes]);

    const embed: APIEmbed = {
      title: `Candidature de ${user.minecraftUser.minecraftNickname}`,
      description: user.candidature,
      color: 0x00ff00,
      author: {
        name: user.minecraftUser.minecraftNickname,
        icon_url: `https://crafatar.com/avatars/${user.minecraftUser.minecraftUUID}?overlay`
      },
      fields: [
        {
          name: "Status",
          value:
            user.role === UserRole.GHOST ? "**En attente**" :
              user.role === UserRole.CANDIDATE ?
                "**🗳️ En attente de vote**" :
                user.role === UserRole.PRE_ACCEPTED ?
                  "**🎙️ En attente d'entretien**" :
                  user.role === UserRole.REFUSED || user.role === UserRole.BAN ?
                    "**❌ Refusé**" : "**✅ Accepté**",
          inline: true
        },
        {
          name: "Ratios",
          value: `**${promiseResolve[0] ? "✅ Ratios positifs" : "❌ Ratios négatifs"}**`,
          inline: true
        },
        {
          name: "Votes requis",
          value: `**${promiseResolve[1]}**`,
          inline: true
        },
        {
          name: "Votes",
          value: `**${promiseResolve[2]}** 👍 / **${promiseResolve[3]}** 👎 / **${promiseResolve[4]}** 🤷 / **${promiseResolve[2] + promiseResolve[3] + promiseResolve[4]}** ✉`,
          inline: true
        }
      ]
    };

    return embed;
  }

  /**
   * Emojis vote callback
   * @param candidat The candidat for which the vote is made
   * @param message The message of the candidature
   */
  candidatureVoteCallback(candidat: UserEntity, message: Message<true>) {
    return async (emoji: MessageReaction, user: User) => {
      // we don't want to listen to the bot reaction
      if (user.bot) return;
      const userWhoVote = await this.userService.findOne(user.id);
      const userWhoIsCandidat = await this.userService.findOne(candidat.discordID);
      // Check if the user who vote exist
      if (!userWhoVote) {
        await this.botUtilityService.sendPrivateMessage(user.id, `Tu dois être inscrit sur litopia.fr sur le discord pour voter pour ${userWhoIsCandidat.minecraftUser.minecraftNickname}`);
        await this.botUtilityService.removeUserReactionFromMessage(message, user, emoji.emoji.name);
        return;
      }
      try {
        // get the vote type from emoji
        const voteType = CandidatureProcessService.emojiToVoteType(emoji.emoji.name);

        //try to vote await need cause vote has side effect and we need to wait for it
        await this.usersVotesService.vote(userWhoVote, userWhoIsCandidat, voteType);

        userWhoVote.updatedAt = new Date();

        // update the message with new votes
        await Promise.all([
          this.updateCandidatureMessage(userWhoIsCandidat),
          this.botUtilityService.sendPrivateMessage(userWhoVote.discordID, `Ton vote ${voteType === VoteType.FOR ? "👍" : voteType === VoteType.AGAINST ? "👎" : "🤷"}a bien était pris en compte pour ${candidat.minecraftUser.minecraftNickname}`),
          this.removeOtherUserReactionFromMessage(message, user, emoji.emoji.name),
          this.userService.update(userWhoVote.discordID, { discordNickname: user.username, discordAvatar: user.avatar })
        ]);
        this.logger.log(`Vote ${voteType} for ${userWhoIsCandidat.discordNickname} by ${userWhoVote.discordNickname}`);
      } catch (e) {
        // In all case remove the reaction of the user
        await this.botUtilityService.removeUserReactionFromMessage(message, user, emoji.emoji.name);

        // if the vote is not accepted send a message to the user
        if (!(e instanceof UserVoteException)) {
          //if it's not a UserVoteException it's a unknow error so send error message to console and private message to user who vote
          this.logger.error(e);
          await this.botUtilityService.sendPrivateMessage(userWhoVote.discordID, `Une erreur est survenue lors de ton vote pour ${userWhoIsCandidat.minecraftUser.minecraftNickname}`);
          return;
        }
        //if it's a UserVoteException it's a know error so send warning message to console and private message to user who vote
        this.logger.warn(e);
        if (e.type === UserVoteErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_VOTE) {
          await this.botUtilityService.sendPrivateMessage(userWhoVote.discordID, `Tu ne peux pas voter pour ${userWhoIsCandidat.minecraftUser.minecraftNickname} car tu es ${userWhoVote.role}`);
          return;
        }
        if (e.type === UserVoteErrorEnum.USER_WHO_WAS_VOTE_IS_NOT_CANDIDATE) {
          await this.botUtilityService.sendPrivateMessage(userWhoVote.discordID, `Tu ne peux pas voter pour ${userWhoIsCandidat.minecraftUser.minecraftNickname} car il n'est pas ou plus candidat`);
          return;
        }
      }
    };
  }

  /**
   * Remove every other reaction of the user on the message
   * @param message The message
   * @param user The user
   * @param emojiOfTheVote The emoji to keep
   */
  private async removeOtherUserReactionFromMessage(message: Message<true>, user: User, emojiOfTheVote: string) {
    // And remove other reaction that the user have potentially made
    const emojiToRemove = CandidatureProcessService.VOTE_EMOJI.filter(e => e !== emojiOfTheVote);
    for (const emoji of emojiToRemove) {
      await this.botUtilityService.removeUserReactionFromMessage(message, user, emoji);
    }
  }

  /**
   * Convert an emoji to a vote type
   * @param emoji
   */
  static emojiToVoteType(emoji: string) {
    switch (emoji) {
      case "👍":
        return VoteType.FOR;
      case "👎":
        return VoteType.AGAINST;
      case "🤷":
        return VoteType.ABSTENTION;
    }
  }

  /**
   * Update the candidature message on discord with last votes
   * @param user
   */
  public async updateCandidatureMessage(user: UserEntity) {
    const candidatureMsg = await this.botUtilityService.getMessagesFromId(this.DISCORD_CANDIDATURE_CHANNEL_ID, user.candidatureDiscordMessageID);
    if (candidatureMsg) {
      const embed = await this.createEmbed(user);
      await candidatureMsg.edit({ embeds: [embed] });
      this.logger.log(`Update candidature message for ${user.discordNickname}`);
    }
  }

  /**
   * Accept a candidat and send a message to the candidat
   * @param userWhoIsAccepted
   * @param userWhoPerformAction
   */
  public async acceptUser(userWhoIsAccepted: UserEntity, userWhoPerformAction: UserEntity) {
    if (![UserRole.LITOGOD, UserRole.UNIQUE_GOD].includes(userWhoPerformAction.role)) {
      return Promise.reject(new CandidatureProcessException(CandidatureProcessErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_ACCEPT));
    }
    if (userWhoIsAccepted.role !== UserRole.PRE_ACCEPTED) {
      return Promise.reject(new CandidatureProcessException(CandidatureProcessErrorEnum.USER_WHO_IS_ACCEPTED_IS_NOT_PRE_ACCEPTED));
    }
    await Promise.all([
      this.userService.acceptUser(userWhoIsAccepted),
      this.botUtilityService.sendPrivateMessage(userWhoIsAccepted.discordID, `Félicitation tu es maintenant accepté sur le serveur de Litopia !`),
      this.botUtilityService.sendMessageToChannel(this.DISCORD_CANDIDATURE_CHANNEL_ID, `Félicitation à ${userWhoIsAccepted.minecraftUser.minecraftNickname} qui est maintenant accepté sur le serveur de Litopia !`)
    ]);
    const updatedUser = await this.userService.findOne(userWhoIsAccepted.discordID);
    await this.updateCandidatureMessage(updatedUser);
    this.logger.log(`User ${userWhoIsAccepted.discordNickname} accepted by ${userWhoPerformAction.discordNickname}`);
  }

  /**
   * Refuse a candidat and send a message to the candidat
   * @param userToReject
   * @param userThatPerformAction
   */
  public async rejectUser(userToReject: UserEntity, userThatPerformAction: UserEntity) {
    if (![UserRole.LITOGOD, UserRole.UNIQUE_GOD].includes(userThatPerformAction.role)) {
      return Promise.reject(new CandidatureProcessException(CandidatureProcessErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_REJECT));
    }
    if (userToReject.role !== UserRole.PRE_ACCEPTED) {
      return Promise.reject(new CandidatureProcessException(CandidatureProcessErrorEnum.USER_WHO_IS_REJECTED_IS_NOT_PRE_ACCEPTED));
    }
    await Promise.all([
      this.userService.rejectUser(userToReject),
      this.botUtilityService.sendPrivateMessage(userToReject.discordID, `Désolé mais tu as été refusé sur le serveur de Litopia !`),
      this.botUtilityService.sendMessageToChannel(this.DISCORD_CANDIDATURE_CHANNEL_ID, `${userToReject.minecraftUser.minecraftNickname} a été refusé. Il ne pourra pas rejoindre le serveur de Litopia !`)
    ]);
    const updatedUser = await this.userService.findOne(userToReject.discordID);
    await this.updateCandidatureMessage(updatedUser);
    this.logger.log(`User ${userToReject.discordNickname} rejected by ${userThatPerformAction.discordNickname}`);
  }
}
