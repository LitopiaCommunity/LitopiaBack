import { forwardRef, Module } from "@nestjs/common";
import { UsersVotesService } from './users-votes.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVoteEntity } from "./user-vote.entity";
import { UsersModule } from "../users/users.module";
import { ConfigModule } from "@nestjs/config";
import { CandidatureProcessModule } from "../candidature-process/candidature-process.module";
import { BotFunctionModule } from "../../bot/utils/bot.function.module";
import { AmpApiModule } from "../../api/amp-api/amp-api.module";

@Module({
  imports:[
    TypeOrmModule.forFeature([UserVoteEntity]),
    UsersModule,
    BotFunctionModule,
    forwardRef(()=>CandidatureProcessModule), // we use forwardRef to avoid circular dependency
    ConfigModule,
    AmpApiModule
  ],
  providers: [UsersVotesService],
  exports:[UsersVotesService]
})
export class UsersVotesModule {}
