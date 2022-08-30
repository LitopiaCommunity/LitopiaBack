import { Injectable } from '@nestjs/common';
import { User } from "./user.entity";
import { DeepPartial, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(user:DeepPartial<User>){
    const newUser = this.usersRepository.create(user);
    return Promise.resolve(this.usersRepository.save(newUser));
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(discordID: string): Promise<User> {
    return this.usersRepository.findOneBy({ discordID });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  update(discordID,user:DeepPartial<User>):Promise<UpdateResult>{
    return Promise.resolve(this.usersRepository.update({discordID},user))
  }
}
