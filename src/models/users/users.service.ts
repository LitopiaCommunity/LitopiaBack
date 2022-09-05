import { Injectable } from '@nestjs/common';
import { UserEntity, UserRole } from "./user.entity";
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

  /**
   * count the number of user that have the list of roles
   * @param roles[]
   */
  countByRoles(roles:UserRole[]):Promise<number>{
    return this.usersRepository.createQueryBuilder('user').where('user.role IN (:...roles)',{roles}).getCount();
  }

  /**
   * Refuse a user and update his role
   * @param userWhoWasVote
   */
  async refuseUser(userWhoWasVote: UserEntity) {
    return this.update(userWhoWasVote.discordID,{role:UserRole.REFUSED});
  }

  /**
   * Accept a user and update his role
   * @param userWhoWasVote
   */
  async preAcceptUser(userWhoWasVote: UserEntity) {
    return this.update(userWhoWasVote.discordID,{role:UserRole.PRE_ACCEPTED});
  }
}
