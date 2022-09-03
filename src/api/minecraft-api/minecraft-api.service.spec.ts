import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftApiService } from './minecraft-api.service';

describe('MinecraftApiService', () => {
  let service: MinecraftApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinecraftApiService],
    }).compile();

    service = module.get<MinecraftApiService>(MinecraftApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
