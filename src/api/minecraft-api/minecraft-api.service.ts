import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { MinecraftProfileDto } from "./dto/minecraftProfile.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class MinecraftApiService {
  static ProfileFromUUID = "https://sessionserver.mojang.com/session/minecraft/profile/";


  constructor(private readonly httpService:HttpService) {
  }

  async getMcProfileFromUUID(uuid:string):Promise<MinecraftProfileDto>{
    const value = await firstValueFrom(this.httpService.get<MinecraftProfileDto>(MinecraftApiService.ProfileFromUUID+uuid))
    if (value.status===204){
      throw new Error("profile not found")
    }
    return value.data
  }
}
