import { Test, TestingModule } from '@nestjs/testing';
import { MinecraftApiService } from './minecraft-api.service';
import { MinecraftApiModule } from "./minecraft-api.module";

describe('MinecraftApiService', () => {
  let service: MinecraftApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[MinecraftApiModule]
    }).compile();

    service = module.get<MinecraftApiService>(MinecraftApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
