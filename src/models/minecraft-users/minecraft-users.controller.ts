import { Controller, Head, Param, ParseUUIDPipe, Res } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MinecraftUsersService } from "./minecraft-users.service";
import { Response } from "express";

@ApiTags('minecraft-users')
@Controller('api/minecraft-users')
export class MinecraftUsersController {

  constructor(private mcUsersService:MinecraftUsersService) {
  }


  @Head(':uuid')
  @ApiOperation({ summary: 'Check if minecraft user exist' })
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'The unique identifier of minecraft user',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiResponse({ status: 200, description: 'Minecraft user exist' })
  @ApiResponse({ status: 400, description: 'The provided string is not a valid uuid' })
  @ApiResponse({ status: 404, description: 'Minecraft user don\'t exist' })
  public async isMinecraftUserExist(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Res() res: Response) {
    const userExist = await this.mcUsersService.isMcUserExist(uuid);
    if (userExist) {
      return res.status(200).send()
    } else {
      return res.status(404).send()
    }
  }
}

