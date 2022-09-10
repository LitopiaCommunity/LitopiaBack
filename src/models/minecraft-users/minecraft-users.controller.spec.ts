import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftUsersController } from './minecraft-users.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MinecraftUserEntity } from "./minecraft-user.entity";
import { MinecraftUsersService } from "./minecraft-users.service";
import { AppModule } from "../../app.module";

describe('MinecraftUsersController', () => {
  let controller: MinecraftUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        AppModule,
        TypeOrmModule.forFeature([MinecraftUserEntity])
      ],
      providers: [MinecraftUsersService],
      controllers: [MinecraftUsersController],
    }).compile();

    controller = module.get<MinecraftUsersController>(MinecraftUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
