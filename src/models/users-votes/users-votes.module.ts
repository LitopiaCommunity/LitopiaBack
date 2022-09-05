import { Module } from '@nestjs/common';
import { UsersVotesService } from './users-votes.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVoteEntity } from "./user-vote.entity";
import { UsersModule } from "../users/users.module";
import { BotModule } from "../../bot/bot.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports:[
    TypeOrmModule.forFeature([UserVoteEntity]),
    UsersModule,
    BotModule,
    ConfigModule
  ],
  providers: [UsersVotesService],
  exports:[UsersVotesService]
})
export class UsersVotesModule {}
