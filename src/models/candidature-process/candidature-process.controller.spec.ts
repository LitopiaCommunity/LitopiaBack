import { Test, TestingModule } from '@nestjs/testing';
import { CandidatureProcessController } from './candidature-process.controller';

describe('CandidatureProcessController', () => {
  let controller: CandidatureProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatureProcessController],
    }).compile();

    controller = module.get<CandidatureProcessController>(CandidatureProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
