import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { AppModule } from "../../app.module";
import { SessionsModule } from "./sessions.module";

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[AppModule,SessionsModule],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
