import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { ConfigModule } from "@nestjs/config";
import { BotFunctionModule } from "../../bot/utils/bot.function.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule,
    BotFunctionModule
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
