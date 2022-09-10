import { Test, TestingModule } from '@nestjs/testing';
import { UsersVotesService } from './users-votes.service';
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVoteEntity } from "./user-vote.entity";
import { BotFunctionModule } from "../../bot/utils/bot.function.module";
import { ConfigModule } from "@nestjs/config";
import { forwardRef } from "@nestjs/common";
import { CandidatureProcessModule } from "../candidature-process/candidature-process.module";

describe('UsersVotesService', () => {
  let service: UsersVotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        TypeOrmModule.forFeature([UserVoteEntity]),
        UsersModule,
        BotFunctionModule,
        forwardRef(()=>CandidatureProcessModule), // we use forwardRef to avoid circular dependency
        ConfigModule
      ],
      providers: [UsersVotesService],
    }).compile();

    service = module.get<UsersVotesService>(UsersVotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
