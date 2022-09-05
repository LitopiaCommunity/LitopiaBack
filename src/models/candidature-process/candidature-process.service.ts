import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { UserEntity, UserRole } from "../users/user.entity";
import { CandidaturePostDto } from "./dto/candidature-post.dto";
import { MinecraftApiService } from "../../api/minecraft-api/minecraft-api.service";
import { CandidatureError } from "./candidature.data";
import { MinecraftUsersService } from "../minecraft-users/minecraft-users.service";
import { UsersService } from "../users/users.service";
import { DeepPartial } from "typeorm";
import { MinecraftUserEntity } from "../minecraft-users/minecraft-user.entity";
import { BotUtilityService } from "../../bot/functions/bot-utility.service";
import { APIEmbed, Message, MessageReaction, User } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { UsersVotesService } from "../users-votes/users-votes.service";
import { VoteType } from "../users-votes/user-vote.entity";
import { UserVoteErrorEnum, UserVoteException } from "../users-votes/user-vote.exception";

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
      role: UserRole.CANDIDATE,
      candidature: candidature.candidature,
      candidatureProposalAt: new Date(),
      minecraftUser: newMcUser
    };

    await this.sendMessageToUser(newUser.discordID);

    const createdUser = await this.userService.create(newUser);

    await this.sendCandidatureToChannel(createdUser);

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
   */
  async sendCandidatureToChannel(user: UserEntity) {
    const embed = await this.createEmbed(user);
    const message = await this.botUtilityService.sendMessageToChannel(process.env.DISCORD_CANDIDATURE_CHANNEL_ID, embed);
    if (message) {
      for (const emoji of CandidatureProcessService.VOTE_EMOJI) {
        await this.botUtilityService.listenForReaction(message, emoji, this.candidatureVoteCallback(user, message));
      }
    }
  }

  /**
   * Create an embed for candidature
   */
  async createEmbed(user: UserEntity) {
    const embed: APIEmbed = {
      title: `Candidature de ${user.minecraftUser.minecraftNickname}`,
      description: user.candidature,
      color: 0x00ff00,
      footer: {
        text: `Candidature de ${user.minecraftUser.minecraftNickname}`,
        icon_url: `https://crafatar.com/avatars/${user.minecraftUser.minecraftUUID}?overlay`
      }
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

        //try to vote
        await this.usersVotesService.vote(userWhoVote, userWhoIsCandidat, voteType);

        // if the vote is accepted send a message to the user
        await this.botUtilityService.sendPrivateMessage(userWhoVote.discordID, `Ton vote ${voteType === VoteType.FOR ? "👍" : voteType === VoteType.AGAINST ? "👎" : "🤷"}a bien était pris en compte pour ${candidat.minecraftUser.minecraftNickname}`);

        // And remove other reaction that the user have potentially made
        const emojiToRemove = CandidatureProcessService.VOTE_EMOJI.filter(e => e !== emoji.emoji.name);
        for (const emoji of emojiToRemove) {
          await this.botUtilityService.removeUserReactionFromMessage(message, user, emoji);
        }
      }catch (e) {
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

}
