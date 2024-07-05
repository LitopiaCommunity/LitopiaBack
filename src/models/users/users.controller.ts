import { Body, Controller, Get, Logger, Param, Post, Query, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserEntity, UserRole } from "./user.entity";
import { ConfigService } from "@nestjs/config";

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  private readonly API_LOCAL_KEY = this.configService.get<string>('API_LOCAL_KEY');
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService:UsersService,private configService:ConfigService) {
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of user is loaded',
    type:UserEntity,
    isArray:true
  })
  async getAllUser(): Promise<UserEntity[]>{
    return this.usersService.findAll()
  }

  @Get('by-roles')
  @ApiQuery({
    name:'userRoles',
    enum:UserRole,
    isArray:true
  })
  @ApiResponse({
    status: 200,
    description: 'List of user is loaded',
    type:UserEntity,
    isArray:true
  })
  async getUserByRoles(@Query()userRoles:{userRoles:UserRole[]}): Promise<UserEntity[]>{
    if (typeof userRoles.userRoles !== "object"){
        userRoles.userRoles = [userRoles.userRoles];
    }
    return this.usersService.getAllUsersWithRoles(userRoles.userRoles)
  }

  @Get('by-nickname')
  @ApiQuery({
    name:'nickname',
    required:true
  })
  @ApiResponse({
    status: 200,
    description: 'User is loaded',
    type:UserEntity
  })
  async getUserByNickname(@Query()minecraftPseudo:{nickname:string}): Promise<UserEntity>{
    return this.usersService.getUserByNickname(minecraftPseudo.nickname)
  }

  @Post(':uuid/last-update')
  @ApiParam({ name: 'uuid', required: true })
  @ApiBody({ description: 'API Key', required: true })
  @ApiResponse({
    status: 200,
    description: 'User last update timestamp has been updated',
    type: UserEntity,
  })
  async updateLastUpdate(
    @Param('uuid') uuid: string,
    @Body() { apiKey }: { apiKey:string },
  ): Promise<UserEntity> {
    if (apiKey !== this.API_LOCAL_KEY) {
      this.logger.warn(`Invalid API Key: ${apiKey}`);
      throw new UnauthorizedException('Invalid API Key');
    }

    return this.usersService.updateLastUpdate(uuid);
  }
}
