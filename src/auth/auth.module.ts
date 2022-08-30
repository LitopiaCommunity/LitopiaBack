import { Module } from "@nestjs/common";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { DiscordStrategy } from "./utils/discord.stretegie";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../models/users/users.module";
import { SessionSerializer } from "./utils/session.serializer";

@Module({
  imports:[
    ConfigModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    DiscordStrategy,
    SessionSerializer,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
  exports: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
})
export class AuthModule {
}
