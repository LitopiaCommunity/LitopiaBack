import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
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

  createUser(mcUser:DeepPartial<MinecraftUserEntity>){
    const newUser = this.usersRepository.create(mcUser)
    return Promise.resolve(this.usersRepository.save(newUser));
  }

}


