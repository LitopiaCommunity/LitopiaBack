import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserController } from './Users/user.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './Users/user.service';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService, UserService],
})
export class AppModule {}
