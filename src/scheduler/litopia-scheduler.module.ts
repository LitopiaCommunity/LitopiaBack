import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { UsersModule } from "../models/users/users.module";

@Module({
  providers: [SchedulerService],
  imports: [UsersModule]
})
export class LitopiaSchedulerModule {}
