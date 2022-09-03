import { Test, TestingModule } from '@nestjs/testing';
import { UsersVotesService } from './users-votes.service';

describe('UsersVotesService', () => {
  let service: UsersVotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersVotesService],
    }).compile();

    service = module.get<UsersVotesService>(UsersVotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
