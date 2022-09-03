import { Module } from '@nestjs/common';
import { CandidatureProcessService } from './candidature-process.service';
import { CandidatureProcessController } from './candidature-process.controller';
import { MinecraftApiModule } from "../../api/minecraft-api/minecraft-api.module";
import { MinecraftUsersModule } from "../minecraft-users/minecraft-users.module";
import { UsersModule } from "../users/users.module";
import { BotModule } from "../../bot/bot.module";

@Module({
  imports:[
    MinecraftApiModule,
    MinecraftUsersModule,
    UsersModule,
    BotModule
  ],
  providers: [CandidatureProcessService],
  controllers: [CandidatureProcessController]
})
export class CandidatureProcessModule {}
