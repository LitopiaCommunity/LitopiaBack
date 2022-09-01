import { Module } from '@nestjs/common';
import { MinecraftUsersService } from './minecraft-users.service';
import { MinecraftUsersController } from './minecraft-users.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MinecraftUserEntity } from "./minecraft-user.entity";

@Module({
  imports:[TypeOrmModule.forFeature([MinecraftUserEntity])],
  providers: [MinecraftUsersService],
  controllers: [MinecraftUsersController]
})
export class MinecraftUsersModule {}
