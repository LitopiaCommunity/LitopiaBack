import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserVoteEntity, VoteType } from "./user-vote.entity";
import { Repository } from "typeorm";
import { UserEntity, UserRole } from "../users/user.entity";
import { UserVoteException, UserVoteErrorEnum } from "./user-vote.exception";

@Injectable()
export class UsersVotesService {
  private readonly logger = new Logger(UsersVotesService.name);


  constructor(@InjectRepository(UserVoteEntity) private userVotesRepository: Repository<UserVoteEntity>) {
  }

  /**
   * Create a new vote form a user to another user
   * @param userWhoVote the user who vote
   * @param userWhoWasVote the user who was vote by the user
   * @param voteType the vote type (like, dislike, neutral)
   */
  async vote(userWhoVote: UserEntity, userWhoWasVote: UserEntity, voteType: VoteType){
    // check if the user who was vote is a candidate
    if(userWhoWasVote.role!==UserRole.CANDIDATE){
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.USER_WHO_WAS_VOTE_IS_NOT_CANDIDATE));
    }

    // check if the user can't vote
    if([UserRole.CANDIDATE,UserRole.PRE_ACCEPTED,UserRole.BAN,UserRole.GHOST,UserRole.REFUSED].includes(userWhoVote.role)){
      return Promise.reject(new UserVoteException(UserVoteErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_VOTE));
    }
    this.logger.log(`User ${userWhoVote.discordID} vote ${voteType} for ${userWhoWasVote.discordID}`);

    // check if there is already a vote
    const vote = await this.userVotesRepository.findOne({
      where:{
        voter:userWhoVote,
        votedFor:userWhoWasVote
      }
    });
    if(vote){
      this.logger.log(`User ${userWhoVote.discordID} already vote ${vote.vote} for ${userWhoWasVote.discordID} so we update the vote`);
      return this.updateVote(vote,voteType);
    }
    // create the vote
    const newVote = this.userVotesRepository.create({
      voter:userWhoVote,
      votedFor:userWhoWasVote,
      vote:voteType
    });
    return Promise.resolve(this.userVotesRepository.save(newVote));
  }

  /**
   * Update the vote of a user to another user
   * @param userVoteEntity the vote to update
   * @param voteType the new vote type
   */
  updateVote(userVoteEntity:UserVoteEntity,voteType:VoteType){
    userVoteEntity.vote = voteType;
    return Promise.resolve(this.userVotesRepository.save(userVoteEntity));
  }

}
