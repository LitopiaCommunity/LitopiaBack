import { Inject, Injectable, Logger } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthenticationTypes, Done, UserKeyStore } from "./authentication.types";
import { User } from "../../models/users/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  private readonly logger=new Logger(SessionSerializer.name)
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthenticationTypes,
  ) {
    super();
  }

  serializeUser(user: User, done: Done) {
    this.logger.log("Serialise "+user.discordID)
    done(null, { discordID:user.discordID });
  }

  async deserializeUser({ discordID }: UserKeyStore, done: Done) {
    this.logger.log("Deserialize "+ discordID)
    const userDB = await this.authService.findUser(discordID);
    return userDB ? done(null, userDB) : done(null, null);
  }
}