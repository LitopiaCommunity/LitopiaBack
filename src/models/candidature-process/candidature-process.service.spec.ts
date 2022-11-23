import { Test, TestingModule } from '@nestjs/testing';
import { CandidatureProcessService } from './candidature-process.service';
import { AppModule } from "../../app.module";
import { CandidatureProcessModule } from "./candidature-process.module";

describe('CandidatureProcessService', () => {
  let service: CandidatureProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        AppModule,
        CandidatureProcessModule
      ],
    }).compile();

    service = module.get<CandidatureProcessService>(CandidatureProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
