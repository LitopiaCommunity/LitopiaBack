import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftUsersService } from './minecraft-users.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MinecraftUserEntity } from "./minecraft-user.entity";
import { AppModule } from "../../app.module";

describe('MinecraftUsersService', () => {
  let service: MinecraftUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        AppModule,
        TypeOrmModule.forFeature([MinecraftUserEntity])
      ],
      providers: [MinecraftUsersService],
    }).compile();

    service = module.get<MinecraftUsersService>(MinecraftUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
