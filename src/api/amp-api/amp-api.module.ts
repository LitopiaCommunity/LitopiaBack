import { Module } from '@nestjs/common';
import { HttpModule } from "@nestjs/axios";
import { AmpApiService } from "./amp-api.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports:[HttpModule,ConfigModule],
  providers: [AmpApiService],
  exports:[AmpApiService]
})
export class AmpApiModule {}
