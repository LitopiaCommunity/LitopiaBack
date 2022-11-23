import { Command, DiscordCommand } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { APIEmbed, CommandInteraction, EmbedBuilder } from "discord.js";
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


  async handler(interaction: CommandInteraction): Promise<any> {
    const users = await this.userService.findAll();
    const nbInscrit = users.length;
    const nbUser = await this.userService.countByRoles([UserRole.GHOST,UserRole.LITOPIEN])
    const nbRefused = await this.userService.countByRoles([UserRole.REFUSED])
    let memberList = "";
    for (const user of users) {
      memberList += "- " + user.discordNickname + " "+ user.role +"\n";
    }
    const embed : APIEmbed = {
      title: "Informations sur les membres",
      description: "Informations sur les membres du serveur",
      color: 0x00ff00,
      fields:[
        {
          name: "Nombre d'inscrits",
          value: nbInscrit.toString(),
          inline: true
        },
        {
          name: "Nombre de membres",
          value: nbUser.toString(),
          inline: true
        },
        {
          name: "Nombre de refusés",
          value: nbRefused.toString(),
          inline: true
        },
      ]
    }

    const embed2 = new EmbedBuilder()
      .setTitle("Liste des membres")
      .setDescription(memberList.substring(0,4096))
      .setColor(0x00ff00)
      .toJSON();

    return {
      embeds: [embed2,embed],
    };
  }

}