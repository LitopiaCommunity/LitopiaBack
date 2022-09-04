import { Module } from '@nestjs/common';
import { UsersVotesService } from './users-votes.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVoteEntity } from "./user-vote.entity";

@Module({
  imports:[TypeOrmModule.forFeature([UserVoteEntity])],
  providers: [UsersVotesService],
  exports:[UsersVotesService]
})
export class UsersVotesModule {}
