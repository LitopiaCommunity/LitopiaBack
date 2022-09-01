import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { MinecraftProfileDto } from "./dto/minecraftProfile.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class MinecraftApiService {
  private readonly logger = new Logger(MinecraftApiService.name)
  static ProfileFromUUID = "https://sessionserver.mojang.com/session/minecraft/profile/";


  constructor(private readonly httpService:HttpService) {
  }

  async getMcProfileFromUUID(uuid:string):Promise<MinecraftProfileDto|null>{
    this.logger.log('Get profile of '+uuid)
    const value = await firstValueFrom(this.httpService.get<MinecraftProfileDto>(MinecraftApiService.ProfileFromUUID+uuid))
    if (value.status===204){
      this.logger.warn('Not found '+uuid+' in minecraft api')
      return null
    }
    this.logger.log(uuid+' coresepond to '+value.data.name)
    return value.data
  }
}
