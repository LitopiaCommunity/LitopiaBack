import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotGateway } from "./bot.gateway";
import { PingCommand } from "./commands/ping.command";
import { MemberCommand } from "./commands/member.command";
import { UsersModule } from "../../models/users/users.module";
import { AcceptCommand } from "./commands/accept.command";
import { CandidatureProcessModule } from "../../models/candidature-process/candidature-process.module";

@Module({
  imports: [
    DiscordModule.forFeature(),
    UsersModule,
    CandidatureProcessModule,
  ],
  controllers: [],
  providers: [BotGateway,PingCommand,MemberCommand,AcceptCommand],
})
export class BotModule{}