import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('users')
@Controller('api/users')
export class UsersController {

  constructor(private usersService:UsersService) {
  }

  @Get()
  async getAllUser(){
    return this.usersService.findAll()
  }
}
