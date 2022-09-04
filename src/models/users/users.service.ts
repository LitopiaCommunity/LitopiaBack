import { Injectable } from '@nestjs/common';
import { UserEntity } from "./user.entity";
import { DeepPartial, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  create(user:DeepPartial<UserEntity>){
    const newUser = this.usersRepository.create(user);
    return Promise.resolve(this.usersRepository.save(newUser));
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      relations:['minecraftUser']
    });
  }

  findOne(discordID: string): Promise<UserEntity> {
    return this.usersRepository.findOne({where:{discordID},relations:['minecraftUser']});
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  update(discordID,user:DeepPartial<UserEntity>):Promise<UpdateResult>{
    return Promise.resolve(this.usersRepository.update({discordID},user))
  }
}
