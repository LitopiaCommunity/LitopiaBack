import { Param, ParamType } from "@discord-nestjs/core";

export class AcceptDto{
  @Param({
    name:"user",
    description:"User to accept",
    type:ParamType.USER,
    required:true,
  })
  userId:string;
}