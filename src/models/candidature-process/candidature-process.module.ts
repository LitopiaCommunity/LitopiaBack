import { Module } from '@nestjs/common';
import { CandidatureProcessService } from './candidature-process.service';
import { CandidatureProcessController } from './candidature-process.controller';
import { MinecraftApiModule } from "../../api/minecraft-api/minecraft-api.module";
import { MinecraftUsersModule } from "../minecraft-users/minecraft-users.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports:[MinecraftApiModule,MinecraftUsersModule,UsersModule],
  providers: [CandidatureProcessService],
  controllers: [CandidatureProcessController]
})
export class CandidatureProcessModule {}
