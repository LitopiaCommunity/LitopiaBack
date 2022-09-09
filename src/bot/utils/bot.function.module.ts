import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotUtilityService } from "./bot-utility.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    DiscordModule.forFeature(),
    HttpModule
  ],
  providers: [BotUtilityService],
  exports:[BotUtilityService]
})
export class BotFunctionModule{}