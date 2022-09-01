import { Test, TestingModule } from '@nestjs/testing';
import { CandidatureProcessService } from './candidature-process.service';

describe('CandidatureProcessService', () => {
  let service: CandidatureProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatureProcessService],
    }).compile();

    service = module.get<CandidatureProcessService>(CandidatureProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
