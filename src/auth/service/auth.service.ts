import { Injectable, Logger } from "@nestjs/common";
import { AuthenticationTypes, UserDetails } from "../utils/authentication.types";
import { UserEntity, UserRole } from "../../models/users/user.entity";
import { UsersService } from "../../models/users/users.service";
import { BotUtilityService } from "../../bot/utils/bot-utility.service";

@Injectable()
export class AuthService implements AuthenticationTypes{
  private readonly logger = new Logger(AuthService.name);

  constructor(private usersService:UsersService, private botUtils:BotUtilityService) {
  }
  async createUser(details: UserDetails) : Promise<UserEntity> {
    this.logger.log("Auth will create " + details.username)
    const newUser = await this.usersService.create({
      discordID: details.discordId,
      discordNickname: details.username,
      discordAvatar: details.avatar,
    })
    await this.usersService.updateRole(newUser, UserRole.GHOST)
    return newUser;
  }

  newUser(user: UserEntity, details: UserDetails) {
    return  {
      ...user,
      discordID: details.discordId,
      discordNickname: details.username,
      discordAvatar: details.avatar,
    }
  }

  findUser(discordId: string): Promise<UserEntity | undefined> {
    return Promise.resolve(this.usersService.findOne(discordId))
  }

  async validateUser(details: UserDetails): Promise<UserEntity> {
    this.logger.log("Auth will validate "+details.username)
    const { discordId } = details;
    const user = await this.usersService.findOne( discordId );
    if (user){
      this.logger.log(details.username+" alredy existe in database so we update it")
      const newUser = this.newUser(user,details)
      await this.usersService.update(discordId,newUser)
      return newUser
    }
    await this.botUtils.automaticallyConnectUserToDiscordServer(details);
    return this.createUser(details);
  }
}
