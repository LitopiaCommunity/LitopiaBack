import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from 'passport-discord';
import { AuthenticationTypes } from "./authentication.types";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthenticationTypes,
    private configService : ConfigService
  ) {
    super({
      clientID: configService.get<string>('DISCORD_CLIENT_ID'),
      clientSecret: configService.get<string>('DISCORD_CLIENT_SECRET'),
      callbackURL: configService.get<string>('DISCORD_CALLBACK_URL'),
      scope: ['identify','guilds.join'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { username, discriminator, id: discordId, avatar } = profile;
    const details = {
      username,
      discriminator,
      discordId,
      avatar,
      accessToken,
      refreshToken,
    };
    return this.authService.validateUser(details);
  }
}