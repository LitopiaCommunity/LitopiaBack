import { TransformPipe } from "@discord-nestjs/common";
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { CandidatureProcessService } from "../../../models/candidature-process/candidature-process.service";
import { UsersService } from "../../../models/users/users.service";
import {
  CandidatureProcessErrorEnum,
  CandidatureProcessException
} from "../../../models/candidature-process/candidature-process.exception";
import { PermissionsBitField } from "discord.js";

@Command({
  name: "accept",
  description: "Commande pour accepter un candidat",
  defaultMemberPermissions:[PermissionsBitField.Flags.KickMembers,PermissionsBitField.Flags.BanMembers]
})
@UsePipes(TransformPipe)
@Injectable()
export class AcceptCommand implements DiscordTransformedCommand<UserDto> {

  constructor(private candidatureProcessService:CandidatureProcessService,private userService:UsersService){}

  async handler(@Payload() dto: UserDto, { interaction }: TransformedCommandExecutionContext) {
    //get user from dto
    const userToAccept = await this.userService.findOne(dto.userId);
    const userThatPerformAction = await this.userService.findOne(interaction.user.id);
    //check if user is in database
    if(!userThatPerformAction){
      return `Vous n'êtes pas enregistré dans la base de données`
    }
    if(!userToAccept){
      return `L'utilisateur n'est pas enregistré dans la base de données`
    }
    try {
      await this.candidatureProcessService.acceptUser(userToAccept,userThatPerformAction);
      return `L'utilisateur ${userToAccept.discordNickname} a été accepté`
    }catch (e){
      if (e instanceof CandidatureProcessException){
        if (e.type===CandidatureProcessErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_ACCEPT){
          return `Vous n'avez pas les droits pour accepter un candidat`
        }
        if (e.type===CandidatureProcessErrorEnum.USER_WHO_IS_ACCEPTED_IS_NOT_PRE_ACCEPTED){
          return `L'utilisateur ${userToAccept.discordNickname} n'est pas pré accepté`
        }
      }
    }


  }
}
