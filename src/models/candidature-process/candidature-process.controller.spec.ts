import { Test, TestingModule } from '@nestjs/testing';
import { CandidatureProcessController } from './candidature-process.controller';
import { CandidatureProcessModule } from "./candidature-process.module";

describe('CandidatureProcessController', () => {
  let controller: CandidatureProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[CandidatureProcessModule],
    }).compile();

    controller = module.get<CandidatureProcessController>(CandidatureProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
