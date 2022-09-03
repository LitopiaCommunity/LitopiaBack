import { Command, DiscordCommand } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { UsersService } from "../../models/users/users.service";

@Command({
  name: "member",
  description: "Commande pour voir les membres du serveur",
})
@Injectable()
export class MemberCommand implements DiscordCommand {

  constructor(private userService: UsersService) {
  }


  async handler(interaction: CommandInteraction): Promise<string> {
    const users = await this.userService.findAll();
    return `Il y a ${users.length} membres sur le serveur : ${users.map(user => user.discordNickname).join(', ')}`;
  }

}