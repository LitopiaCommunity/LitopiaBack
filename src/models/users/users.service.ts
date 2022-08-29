import { Injectable } from '@nestjs/common';
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(discordID: string,minecraftUUID:string): Promise<User> {
    return this.usersRepository.findOneBy({ discordID,minecraftUUID });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
