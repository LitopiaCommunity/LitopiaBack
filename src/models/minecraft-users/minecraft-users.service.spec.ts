import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftUsersService } from './minecraft-users.service';

describe('MinecraftUsersService', () => {
  let service: MinecraftUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftUsersService],
    }).compile();

    service = module.get<MinecraftUsersService>(MinecraftUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
