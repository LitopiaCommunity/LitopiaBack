import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from "@discord-nestjs/core";
import { TransformPipe } from "@discord-nestjs/common";
import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { CandidatureProcessService } from "../../../models/candidature-process/candidature-process.service";
import { UsersService } from "../../../models/users/users.service";
import {
  CandidatureProcessErrorEnum,
  CandidatureProcessException
} from "../../../models/candidature-process/candidature-process.exception";

@Command({
  name: "reject",
  description: "Commande pour refuser un candidat",
  defaultMemberPermissions:["KickMembers","BanMembers"]
})
@UsePipes(TransformPipe)
@Injectable()
export class RejectCommand implements DiscordTransformedCommand<UserDto> {

  constructor(private candidatureProcessService:CandidatureProcessService,private userService:UsersService) {
  }

  async handler(@Payload() dto: UserDto, { interaction }: TransformedCommandExecutionContext) {
    //get user from dto
    const userToReject = await this.userService.findOne(dto.userId);
    const userThatPerformAction = await this.userService.findOne(interaction.user.id);
    //check if user is in database
    if (!userThatPerformAction) {
      return `Vous n'êtes pas enregistré dans la base de données`
    }
    if (!userToReject) {
      return `L'utilisateur n'est pas enregistré dans la base de données`
    }
    try {
      await this.candidatureProcessService.rejectUser(userToReject, userThatPerformAction);
      return `L'utilisateur ${userToReject.discordNickname} a été refusé`
    } catch (e) {
      if (e instanceof CandidatureProcessException) {
        if (e.type === CandidatureProcessErrorEnum.USER_HAS_NOT_THE_RIGHT_TO_REJECT) {
          return `Vous n'avez pas les droits pour refusé un candidat`
        }
        if (e.type === CandidatureProcessErrorEnum.USER_WHO_IS_REJECTED_IS_NOT_PRE_ACCEPTED) {
          return `L'utilisateur ${userToReject.discordNickname} n'est pas pré accepté`
        }
      }
    }
  }

}