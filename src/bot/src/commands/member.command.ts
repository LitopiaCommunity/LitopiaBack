import { Command, DiscordCommand } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { UsersService } from "../../../models/users/users.service";
import { UserRole } from "../../../models/users/user.entity";

@Command({
  name: "member",
  description: "Commande pour voir les membres du serveur",
  defaultMemberPermissions:["SendMessages"]
})
@Injectable()
export class MemberCommand implements DiscordCommand {

  constructor(private readonly userService: UsersService) {
  }


  async handler(interaction: CommandInteraction): Promise<string> {
    const users = await this.userService.findAll();
    const nbUser = await this.userService.countByRoles([UserRole.GHOST,UserRole.LITOPIEN])
    return `Il y a ${users.length} membres sur le serveur : ${users.map(user => user.discordNickname).join(', ')} et ${nbUser} litoiens`
  }

}