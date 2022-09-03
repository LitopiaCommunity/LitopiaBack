import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotGateway } from "./bot.gateway";
import { PingCommand } from "./commands/ping.command";
import { MemberCommand } from "./commands/member.command";
import { UsersModule } from "../models/users/users.module";
import { BotUtilityService } from "./functions/bot-utility.service";

@Module({
  imports: [
    DiscordModule.forFeature(),
    UsersModule
  ],
  controllers: [],
  providers: [BotGateway,PingCommand,MemberCommand,BotUtilityService],
  exports: [BotUtilityService]
})
export class BotModule{}