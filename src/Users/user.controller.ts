import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async signupUser(@Body() userData: UserModel): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get('user/:idDiscord/:idMinecraft')
  async getUser(
    @Param('idDiscord') idDiscord: string,
    @Param('idMinecraft') idMinecraft: string,
  ): Promise<any> {
    return this.userService.user({
      discordId_minecraftId: { discordId: idDiscord, minecraftId: idMinecraft },
    });
  }
}
