import { Controller, Get, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserRole } from "./user.entity";

@ApiTags('users')
@Controller('api/users')
export class UsersController {

  constructor(private usersService:UsersService) {
  }

  @Get()
  async getAllUser(){
    return this.usersService.findAll()
  }

  @Get('by-roles')
  @ApiQuery({
    name:'userRoles',
    enum:UserRole,
    isArray:true
  })
  async getUserByRoles(@Query()userRoles:{userRoles:UserRole[]}){
    if (typeof userRoles.userRoles !== "object"){
        userRoles.userRoles = [userRoles.userRoles];
    }
    return this.usersService.getAllUsersWithRoles(userRoles.userRoles)
  }
}
