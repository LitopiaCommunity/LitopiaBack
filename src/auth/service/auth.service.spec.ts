import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BotFunctionModule } from "../../bot/utils/bot.function.module";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../../models/users/users.module";
import { AuthController } from "../controller/auth.controller";
import { DiscordStrategy } from "../utils/discord.stretegie";
import { SessionSerializer } from "../utils/session.serializer";
import { AppModule } from "../../app.module";

describe('AuthService', () => {
  let service: AuthService;

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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
