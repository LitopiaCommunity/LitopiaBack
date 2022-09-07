import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { BotUtilityService } from "./bot-utility.service";

@Module({
  imports: [
    DiscordModule.forFeature(),
    ],
  providers: [BotUtilityService],
  exports:[BotUtilityService]
})
export class BotFunctionModule{}