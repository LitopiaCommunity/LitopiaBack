import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { BotFunctionModule } from "../../bot/utils/bot.function.module";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../../models/users/users.module";
import { DiscordStrategy } from "../utils/discord.stretegie";
import { SessionSerializer } from "../utils/session.serializer";
import { AuthService } from "../service/auth.service";
import { AppModule } from "../../app.module";

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        AppModule,
        BotFunctionModule,
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
