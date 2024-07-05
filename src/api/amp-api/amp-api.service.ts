import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AmpApiService {
  private readonly logger = new Logger(AmpApiService.name)

  private readonly AMP_HOST = this.configService.get<string>('AMP_HOST')
  private readonly AMP_INSTANCE = this.configService.get<string>('AMP_INSTANCE')
  private readonly AMP_LOGIN = this.configService.get<string>('AMP_LOGIN')
  private readonly AMP_PASS = this.configService.get<string>('AMP_PASS')

  private readonly WHITELIST_COMMAND = ({player:player})=>`whitelist add ${player}`

  private readonly baseUrl = `https://${this.AMP_HOST}/API/ADSModule/Servers/${this.AMP_INSTANCE}`



  constructor(private readonly httpService:HttpService,private readonly configService:ConfigService) {
  }

  private async getAmpToken(){
    const value = await firstValueFrom(this.httpService.post(`${this.baseUrl}/API/Core/Login`,{
      username:this.AMP_LOGIN,
      password:this.AMP_PASS,
      rememberMe:false,
      token:''
    }))
    if(value.data.error){
      this.logger.error("Token can not be get " + value.data.error)
      return null
    }
    this.logger.log("Token has been get")
    return value.data.sessionID
  }

  private async sendCommandToAmpServer(command:string){
    const token = await this.getAmpToken()
    const value = await firstValueFrom(this.httpService.post(`${this.baseUrl}/API/Core/SendConsoleMessage`,{
      SESSIONID:token,
      message:command
    }))
    if(value.data?.error){
      this.logger.error( `can not post this command : ${command} to the server cause : `+value.data.error)
      return null
    }
    this.logger.log(`Command : '${command}' has been send to the server`)
    return value.status
  }

  addPlayerToWhitelist(player:string){
    return this.sendCommandToAmpServer(this.WHITELIST_COMMAND({ player }))
  }

}
