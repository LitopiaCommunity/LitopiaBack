import { Module } from '@nestjs/common';
import { MinecraftApiService } from './minecraft-api.service';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports:[HttpModule],
  providers: [MinecraftApiService]
})
export class MinecraftApiModule {}
