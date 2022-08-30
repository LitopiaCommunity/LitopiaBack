import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionEntity } from "./session.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionsService],
  exports:[SessionsService]
})
export class SessionsModule {}
