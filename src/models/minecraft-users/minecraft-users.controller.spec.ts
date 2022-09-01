import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftUsersController } from './minecraft-users.controller';

describe('MinecraftUsersController', () => {
  let controller: MinecraftUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinecraftUsersController],
    }).compile();

    controller = module.get<MinecraftUsersController>(MinecraftUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
