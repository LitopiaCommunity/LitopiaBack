import { Param, ParamType } from "@discord-nestjs/core";


export class VoteDto {
  @Param({
    name:"user",
    description:"L'utilisateur concerné par la commande",
    type:ParamType.USER,
    required:false,
  })
  userId:string;
}