import { Module } from '@nestjs/common';
import { UsersVotesService } from './users-votes.service';

@Module({
  providers: [UsersVotesService]
})
export class UsersVotesModule {}
