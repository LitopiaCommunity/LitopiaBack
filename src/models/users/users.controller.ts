import { Controller, Get, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserEntity, UserRole } from "./user.entity";

@ApiTags('users')
@Controller('api/users')
export class UsersController {

  constructor(private usersService:UsersService) {
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
}
