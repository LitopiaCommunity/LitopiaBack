import { HttpStatus, Injectable } from "@nestjs/common";
import { UserEntity, UserRole } from "../users/user.entity";
import { CandidaturePostDto } from "./dto/candidature-post.dto";
import { MinecraftApiService } from "../../api/minecraft-api/minecraft-api.service";
import { CandidatureError } from "./candidature.data";
import { MinecraftUsersService } from "../minecraft-users/minecraft-users.service";
import { UsersService } from "../users/users.service";
import { DeepPartial } from "typeorm";
import { MinecraftUserEntity } from "../minecraft-users/minecraft-user.entity";

@Injectable()
export class CandidatureProcessService {

  constructor(private mcAPIService:MinecraftApiService,private mcUserService:MinecraftUsersService, private userService:UsersService) {
  }

  /**
   * Create a candidature for a user
   * This method will return a CandidatureError if :
   * - the user is already create a candidature or have candidate
   * - minecraft user already used by another user
   * - the provided uuid is not valid
   * @param user The authenticated user who want to create a candidature
   * @param candidature The candidature data for inscription
   */
  async postCandidature(user: UserEntity, candidature: CandidaturePostDto) : Promise<CandidatureError | UserEntity>{
    // Check if the user is already have a candidature
    if(user.role!==UserRole.GHOST){
      return {code:HttpStatus.BAD_REQUEST,message:'You can not candidate if you already have been candidate'}
    }

    // Check if the user is in the minecraft server
    if(await this.mcUserService.isMcUserExist(candidature.minecraftUUID)){
      return {code:HttpStatus.BAD_REQUEST,message:'This minecraft user is already used'}
    }

    // Check if the provided minecraft uuid is valid
    const profile = await this.mcAPIService.getMcProfileFromUUID(candidature.minecraftUUID)
    if (!profile) {
      return {code:HttpStatus.BAD_REQUEST,message:'The provided minecraft UUID is not found'}
    }

    // Create a reference to user
    let newUser:DeepPartial<UserEntity> = null;

    const minecraftUser:DeepPartial<MinecraftUserEntity> = {
      minecraftUUID: profile.id,
      minecraftNickname: profile.name,
      user:newUser
    }

    // create new minecraft user if not exist
    const newMcUser = await this.mcUserService.createUser(minecraftUser)

    newUser = {
      ...user,
      role:UserRole.CANDIDATE,
      candidature:candidature.candidature,
      candidatureProposalAt:new Date(),
      minecraftUser:newMcUser,
    }

    return this.userService.create(newUser);
  }

}
