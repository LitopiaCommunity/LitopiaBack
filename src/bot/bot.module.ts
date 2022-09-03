import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotGateway } from "./bot.gateway";
import { PingCommand } from "./commands/ping.command";
import { MemberCommand } from "./commands/member.command";
import { UsersModule } from "../models/users/users.module";

@Module({
  imports: [
    DiscordModule.forFeature(),
    UsersModule
  ],
  controllers: [],
  providers: [BotGateway,PingCommand,MemberCommand]
})
export class BotModule{}