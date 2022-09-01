import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MinecraftUserEntity } from "./minecraft-user.entity";

@Injectable()
export class MinecraftUsersService {

  constructor(@InjectRepository(MinecraftUserEntity)
              private usersRepository: Repository<MinecraftUserEntity>) {
  }

  async isMcUserExist(uuid: string) {
    const user = await this.usersRepository.findOneBy({ minecraftUUID: uuid });
    return user!==null;
  }

}


