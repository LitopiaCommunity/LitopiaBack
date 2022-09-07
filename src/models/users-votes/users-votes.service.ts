import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserVoteEntity, VoteType } from "./user-vote.entity";
import { Repository } from "typeorm";
import { UserEntity, UserRole } from "../users/user.entity";
import { UserVoteErrorEnum, UserVoteException } from "./user-vote.exception";
import { UsersService } from "../users/users.service";
import { BotUtilityService } from "../../bot/utils/bot-utility.service";
import { ConfigService } from "@nestjs/config";
import { CandidatureProcessService } from "../candidature-process/candidature-process.service";

@Injectable()
export class UsersVotesService {
  private readonly logger = new Logger(UsersVotesService.name);
  private DISCORD_CANDIDATURE_CHANNEL_ID = this.configService.get<string>("DISCORD_CANDIDATURE_CHANNEL_ID");
  // hashmap to store if acceptation process is already launch for a user
  private acceptationProcessLaunched: { [key: string]: boolean } = {};

  constructor(
    @InjectRepository(UserVoteEntity) private userVotesRepository: Repository<UserVoteEntity>,
    private usersService: UsersService,
    private botUtils: BotUtilityService,
    @Inject(forwardRef(() => CandidatureProcessService)) // we use forwardRef to avoid circular dependency
    private candidatureProcessService: CandidatureProcessService,
    private configService: ConfigService) {
  }

  /**
   * Create a new vote form a user to another user
   * @param userWhoVote the user who vote
   * @param userWhoWasVote the user who was vote by the user
   * @param voteType the vote type (like, dislike, neutral)
   */
  async vote(userWhoVote: UserEntity, userWhoWasVote: UserEntity, voteType: VoteType) {
    // check if the user who was vote is a candidate
    if (userWhoWasVote.role !== UserRole.CANDIDATE) {
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.USER_WHO_WAS_VOTE_IS_NOT_CANDIDATE));
    }

    // check if the user can't vote
    if ([UserRole.CANDIDATE, UserRole.PRE_ACCEPTED, UserRole.BAN, UserRole.GHOST, UserRole.REFUSED].includes(userWhoVote.role)) {
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_VOTE));
    }
    this.logger.log(`User ${userWhoVote.discordID} vote ${voteType} for ${userWhoWasVote.discordID}`);

    // check if there is already a vote
    const vote = await this.userVotesRepository.findOne({
      where: {
        voter: userWhoVote,
        votedFor: userWhoWasVote
      }
    });
    if (vote) {
      this.logger.log(`User ${userWhoVote.discordID} already vote ${vote.vote} for ${userWhoWasVote.discordID} so we update the vote`);
      return this.updateVote(vote, voteType);
    }
    // create the vote
    const newVote = this.userVotesRepository.create({
      voter: userWhoVote,
      votedFor: userWhoWasVote,
      vote: voteType
    });

    const theFinalVote = await this.userVotesRepository.save(newVote);

    try {
      // launch the acceptance process
      await this.prepareProcess(userWhoWasVote);
    } catch (e) {
      this.logger.error(e.type);
    }

    return theFinalVote;
  }

  private async prepareProcess(user: UserEntity) {
    const requiredNumberOfVotes = await this.getRequiredNumberOfVotes();
    const numberOfVotes = await this.getNumberOfVotes(user);

    // if not enough vote, we do nothing
    if (numberOfVotes < requiredNumberOfVotes) {
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.NOT_ENOUGH_VOTE));
    }
    // if the process is not already launched, we launch it
    if (!this.acceptationProcessLaunched[user.discordID]) {
      //set the process as prepare to launched
      this.acceptationProcessLaunched[user.discordID] = true;

      // if enough vote, we check inform litopien that this user as enough vote,
      // and we launch the acceptance process with a delay of 5 minutes
      await this.botUtils.sendMessageToChannel(this.DISCORD_CANDIDATURE_CHANNEL_ID, `Le candidat <@${user.discordID}> a reçu ${numberOfVotes} votes, il vous reste donc 5 minutes pour voter ou changer d'avis !`);
      setTimeout(() => this.userAcceptationProcess(user), 1000 * 60 * 5);
    }
  }

  /**
   * Launch the acceptance process for a user
   * @param userWhoWasVote the user to accept
   */
  private async userAcceptationProcess(userWhoWasVote: UserEntity) {
    // remove the user from the hashmap
    delete this.acceptationProcessLaunched[userWhoWasVote.discordID];

    // check if the user who was vote is a candidate
    if (userWhoWasVote.role !== UserRole.CANDIDATE) {
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.USER_WHO_WAS_VOTE_IS_NOT_CANDIDATE));
    }

    // check if enough user have vote
    const requiredNumberOfVotes = await this.getRequiredNumberOfVotes();
    const numberOfVotes = await this.getNumberOfVotes(userWhoWasVote);

    // if not enough vote, we do nothing
    if (numberOfVotes < requiredNumberOfVotes) {
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.NOT_ENOUGH_VOTE));
    }

    // if enough vote, we check if the user has positive ratio to be accepted
    if (!await this.hasPositiveRatio(userWhoWasVote)) {
      // if the user has not positive ratio, we refuse him
      await Promise.all([this.usersService.refuseUser(userWhoWasVote), this.notifyUsers(userWhoWasVote, false)]);
      const updatedUser = await this.usersService.findOne(userWhoWasVote.discordID);
      return await this.candidatureProcessService.updateCandidatureMessage(updatedUser);
    }

    // if the user has positive ratio, we accept him
    await Promise.all([this.usersService.preAcceptUser(userWhoWasVote), this.notifyUsers(userWhoWasVote, true)]);
    const updatedUser = await this.usersService.findOne(userWhoWasVote.discordID);
    return await this.candidatureProcessService.updateCandidatureMessage(updatedUser);
  }

  /**
   * Update the vote of a user to another user
   * @param userVoteEntity the vote to update
   * @param voteType the new vote type
   */
  private updateVote(userVoteEntity: UserVoteEntity, voteType: VoteType) {
    userVoteEntity.vote = voteType;
    return Promise.resolve(this.userVotesRepository.save(userVoteEntity));
  }

  /**
   * Get number of votes for a user
   * @param user the user to check
   */
  async getNumberOfVotes(user: UserEntity) {
    return this.userVotesRepository.createQueryBuilder("userVote")
      .where("userVote.votedForID = :user", { user: user.discordID })
      .getCount();
  }

  /**
   * Get number of selected votes for a user
   * @param user the user to check
   * @param voteType the vote type to check
   */
  async getNumberOfSelectedVotes(user: UserEntity, voteType: VoteType) {
    return this.userVotesRepository.createQueryBuilder("userVote")
      .where("userVote.votedForID = :user", { user: user.discordID })
      .andWhere("userVote.vote = :voteType", { voteType })
      .getCount();
  }

  /**
   * Get required number of votes for a user
   */
  async getRequiredNumberOfVotes() {
    const nbMember = await this.usersService.countByRoles([
      UserRole.UNIQUE_GOD,
      UserRole.LITOGOD,
      UserRole.ACTIVE_LITOPIEN,
      UserRole.LITOPIEN,
      UserRole.INACTIVE_LITOPIEN,
      UserRole.PRETOPIEN
    ]);
    return Math.ceil(nbMember * 0.35);
  }

  /**
   * check if a user as correct ratio of vote
   * @param user the user to check
   */
  async hasPositiveRatio(user: UserEntity) {
    const requiredNumberOfVotes = await this.getNumberOfVotes(user);
    const numberOfVotesFor = await this.getNumberOfSelectedVotes(user, VoteType.FOR);
    const numberOfVotesNeutral = await this.getNumberOfSelectedVotes(user, VoteType.ABSTENTION);
    // if the user has more than 50% of neutral vote, we refuse him
    if (numberOfVotesNeutral > requiredNumberOfVotes * 0.5) {
      return false;
    }
    return numberOfVotesFor >= (requiredNumberOfVotes - numberOfVotesNeutral) * 0.75;
  }

  /**
   * Notify the user if he has been accepted or not
   * @param user the user to notify
   * @param accepted true if the user has been accepted, false if not
   */
  private async notifyUsers(user: UserEntity, accepted: boolean) {
    await this.botUtils.sendPrivateMessage(user.discordID,
      accepted ?
        `Félicitation, les Litopien on voté pour t'accepter sur le serveur Litopia ! 
        Cependant le processus de candidature n'est pas encore fini tu doit passer un entretient avec les Litodieux. 
        Nous allons te contacter pochainement pour passer ton entretient vocal` :
        `Malheureusement, tu n'as pas été accepté sur le serveur Litopia.`
    );
    await this.botUtils.sendMessageToChannel(this.DISCORD_CANDIDATURE_CHANNEL_ID,
      `<@${user.discordID}> a été ${accepted ? "accepté ! Bienvenue à lui" : "refusé. Dommage !"}`
    );
  }
}
