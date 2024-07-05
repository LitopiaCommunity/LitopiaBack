import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserEntity, UserRole } from "./user.entity";
import { DeepPartial, In, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BotUtilityService } from "../../bot/utils/bot-utility.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersService {
  private DISCORD_GUILD_ID = this.configService.get<string>("DISCORD_GUILD_ID");
  private DISCORD_ROLE_GHOST = this.configService.get<string>("DISCORD_ROLE_GHOST");
  private DISCORD_ROLE_CANDIDATE = this.configService.get<string>("DISCORD_ROLE_CANDIDATE");
  private DISCORD_ROLE_PRE_ACCEPTED = this.configService.get<string>("DISCORD_ROLE_PRE_ACCEPTED");
  private DISCORD_ROLE_PRETOPIEN = this.configService.get<string>("DISCORD_ROLE_PRETOPIEN");
  private DISCORD_ROLE_LITOPIEN = this.configService.get<string>("DISCORD_ROLE_LITOPIEN");
  private DISCORD_ROLE_ACTIVE_LITOPIEN = this.configService.get<string>("DISCORD_ROLE_ACTIVE_LITOPIEN");
  private DISCORD_ROLE_INACTIVE_LITOPIEN = this.configService.get<string>("DISCORD_ROLE_INACTIVE_LITOPIEN");
  private DISCORD_ROLE_REFUSED = this.configService.get<string>("DISCORD_ROLE_REFUSED");
  private DISCORD_ROLE_LITOGOD = this.configService.get<string>("DISCORD_ROLE_LITOGOD");
  private DISCORD_ROLE_UNIQUE_GOD = this.configService.get<string>("DISCORD_ROLE_UNIQUE_GOD");

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private botService: BotUtilityService,
    private configService: ConfigService
  ) {
  }

  create(user: DeepPartial<UserEntity>) {
    const newUser = this.usersRepository.create(user);
    return Promise.resolve(this.usersRepository.save(newUser));
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      relations: ["minecraftUser"]
    });
  }

  findOne(discordID: string): Promise<UserEntity> {
    return this.usersRepository.findOne({ where: { discordID }, relations: ["minecraftUser"] });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  update(discordID, user: DeepPartial<UserEntity>): Promise<UpdateResult> {
    return Promise.resolve(this.usersRepository.update({ discordID }, user));
  }

  /**
   * count the number of user that have the list of roles
   * @param roles[]
   */
  countByRoles(roles: UserRole[]): Promise<number> {
    return this.usersRepository.createQueryBuilder("user").where("user.role IN (:...roles)", { roles }).getCount();
  }

  /**
   * Refuse a user and update his role
   * @param userWhoWasVote
   */
  async refuseUser(userWhoWasVote: UserEntity) {
    return this.updateRole(userWhoWasVote, UserRole.REFUSED);
  }
  /**
   * Accept a user and update his role
   * @param userWhoWasVote
   */
  async acceptUser(userWhoWasVote: UserEntity) {
    if (userWhoWasVote.role !== UserRole.CANDIDATE) {
      throw new Error("User is not pre candidate");
    }
    await this.update(userWhoWasVote.discordID, { candidatureAcceptedAt: new Date() });
    return await this.updateRole(userWhoWasVote, UserRole.PRETOPIEN);
  }

  /**
   * Rejected a user and update his role
   * @param userToReject
   */
  async rejectUser(userToReject: UserEntity) {
    if (userToReject.role !== UserRole.PRE_ACCEPTED) {
      throw new Error("User is not pre accepted");
    }
    return await this.updateRole(userToReject, UserRole.REFUSED);
  }

  /**
   * Update the role of a user in both database and discord
   * @param user
   * @param role
   */
  async updateRole(user: UserEntity, role: UserRole) {
    await this.update(user.discordID, { role: role });
    await this.botService.addRole(user.discordID, this.DISCORD_GUILD_ID, this.getDiscordRole(role));
    switch (role) {
      case UserRole.CANDIDATE:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_GHOST);
        break;
      case UserRole.PRE_ACCEPTED:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_CANDIDATE);
        break;
      case UserRole.PRETOPIEN:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_PRE_ACCEPTED);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_CANDIDATE);
        break;
      case UserRole.LITOPIEN:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_PRETOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_INACTIVE_LITOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_ACTIVE_LITOPIEN);
        break;
      case UserRole.ACTIVE_LITOPIEN:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_INACTIVE_LITOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_PRETOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_LITOPIEN);
        break;
      case UserRole.INACTIVE_LITOPIEN:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_PRETOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_LITOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_ACTIVE_LITOPIEN);
        break;
      case UserRole.REFUSED:
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_PRE_ACCEPTED);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_LITOPIEN);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_CANDIDATE);
        await this.botService.removeRole(user.discordID, this.DISCORD_GUILD_ID, this.DISCORD_ROLE_GHOST);
        break;
    }

  }


  /**
   * Return the discord role id of a user role
   * @param role UserRole
   */
  private getDiscordRole(role: UserRole) {
    switch (role) {
      case UserRole.GHOST:
        return this.DISCORD_ROLE_GHOST;
      case UserRole.CANDIDATE:
        return this.DISCORD_ROLE_CANDIDATE;
      case UserRole.PRE_ACCEPTED:
        return this.DISCORD_ROLE_PRE_ACCEPTED;
      case UserRole.PRETOPIEN:
        return this.DISCORD_ROLE_PRETOPIEN;
      case UserRole.LITOPIEN:
        return this.DISCORD_ROLE_LITOPIEN;
      case UserRole.ACTIVE_LITOPIEN:
        return this.DISCORD_ROLE_ACTIVE_LITOPIEN;
      case UserRole.INACTIVE_LITOPIEN:
        return this.DISCORD_ROLE_INACTIVE_LITOPIEN;
      case UserRole.REFUSED:
        return this.DISCORD_ROLE_REFUSED;
      case UserRole.LITOGOD:
        return this.DISCORD_ROLE_LITOGOD;
      case UserRole.UNIQUE_GOD:
        return this.DISCORD_ROLE_UNIQUE_GOD;
    }
  }

  /**
   * Get all the users that have the role and join the minecraft user entity
   * @param roles UserRole[]
   */
  async getAllUsersWithRoles(roles: UserRole[]): Promise<UserEntity[]> {
    return await this.usersRepository.find({ where: { role: In(roles) }, relations: ["minecraftUser"] });
  }

  /**
   * Get a user by his minecraft pseudo
   * @param minecraftNickname string
   */
  async getUserByNickname(minecraftNickname: string): Promise<UserEntity> {
    // le wehere se trouve dans munecraftUser.minecrafPseudo car c'est le nom de la colonne dans la table minecraftUser
    return await this.usersRepository.createQueryBuilder("user").leftJoinAndSelect("user.minecraftUser", "minecraftUser").where("minecraftUser.minecraftNickname = :minecraftNickname", { minecraftNickname }).getOne();
  }


  async updateLastUpdate(uuid: string): Promise<UserEntity> {
    const user = await this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.minecraftUser", "minecraftUser")
      .where("minecraftUser.minecraftUUID = :uuid", { uuid }).getOne();
    if (!user) {
      this.logger.warn(`User not found with uuid: ${uuid}`);
      throw new NotFoundException('User not found');
    }

    user.lastActivity = new Date();
    return this.usersRepository.save(user);
  }

}
