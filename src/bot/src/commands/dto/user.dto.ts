import { Param, ParamType } from "@discord-nestjs/core";

export class UserDto {
  @Param({
    name:"user",
    description:"L'utilisateur concerné par la commande",
    type:ParamType.USER,
    required:true,
  })
  userId:string;
}