import { Controller, Get, Param, Post, Body, Header } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { toJson } from '../globalFunction';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async signupUser(@Body() userData: UserModel): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get('user/:idDiscord/:idMinecraft')
  @Header('Content-Type', 'application/json')
  async getUser(
    @Param('idDiscord') idDiscord: string,
    @Param('idMinecraft') idMinecraft: string,
  ): Promise<any> {
    return toJson(
      await this.userService.user({
        discordId_minecraftId: {
          discordId: idDiscord,
          minecraftId: idMinecraft,
        },
      }),
    );
  }
}
