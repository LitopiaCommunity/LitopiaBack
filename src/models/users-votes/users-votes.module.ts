import { forwardRef, Module } from "@nestjs/common";
import { UsersVotesService } from './users-votes.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVoteEntity } from "./user-vote.entity";
import { UsersModule } from "../users/users.module";
import { BotModule } from "../../bot/bot.module";
import { ConfigModule } from "@nestjs/config";
import { CandidatureProcessModule } from "../candidature-process/candidature-process.module";

@Module({
  imports:[
    TypeOrmModule.forFeature([UserVoteEntity]),
    UsersModule,
    BotModule,
    forwardRef(()=>CandidatureProcessModule), // we use forwardRef to avoid circular dependency
    ConfigModule
  ],
  providers: [UsersVotesService],
  exports:[UsersVotesService]
})
export class UsersVotesModule {}
