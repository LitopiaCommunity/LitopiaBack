import { Command, DiscordCommand } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandInteraction } from "discord.js";

@Command({
  name: "ping",
  description: "Le bot répond pong",
  defaultMemberPermissions:["ViewChannel"]
})
@Injectable()
export class PingCommand implements DiscordCommand {

  handler(interaction: CommandInteraction): string {
    return 'pong';
  }

}