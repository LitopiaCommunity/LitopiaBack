import { Module } from '@nestjs/common';
import { CandidatureProcessService } from './candidature-process.service';
import { CandidatureProcessController } from './candidature-process.controller';
import { MinecraftApiModule } from "../../api/minecraft-api/minecraft-api.module";
import { MinecraftUsersModule } from "../minecraft-users/minecraft-users.module";
import { UsersModule } from "../users/users.module";
import { BotModule } from "../../bot/bot.module";
import { ConfigModule } from "@nestjs/config";
import { UsersVotesModule } from "../users-votes/users-votes.module";

@Module({
  imports:[
    ConfigModule,
    MinecraftApiModule,
    MinecraftUsersModule,
    UsersModule,
    BotModule,
    UsersVotesModule,
  ],
  providers: [CandidatureProcessService],
  controllers: [CandidatureProcessController],
  exports:[CandidatureProcessService]
})
export class CandidatureProcessModule {}
