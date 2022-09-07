import { forwardRef, Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotGateway } from "./bot.gateway";
import { PingCommand } from "./commands/ping.command";
import { MemberCommand } from "./commands/member.command";
import { UsersModule } from "../models/users/users.module";
import { BotUtilityService } from "./functions/bot-utility.service";
import { AcceptCommand } from "./commands/accept.command";
import { CandidatureProcessModule } from "../models/candidature-process/candidature-process.module";

@Module({
  imports: [
    DiscordModule.forFeature(),
    UsersModule,
    forwardRef(()=>CandidatureProcessModule), // we use forwardRef to avoid circular dependency
  ],
  controllers: [],
  providers: [BotGateway,PingCommand,MemberCommand,BotUtilityService,AcceptCommand],
  exports: [BotUtilityService]
})
export class BotModule{}