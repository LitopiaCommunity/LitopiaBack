import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { MinecraftUserEntity } from "../minecraft-users/minecraft-user.entity";
import { UserVoteEntity } from "../users-votes/user-vote.entity";


/**
 * The process of role designation
 *                                                     |-> BAN
 * GHOST -> CANDIDATE -> PRE_ACCEPTED -> PRETOPIEN -> LITOPIEN -> ACTIVE_LITOPIEN -> INACTIVE_LITOPIEN -> BAN
 *                    |-> REFUSED     |-> REFUSED
 */


export enum UserRole {
  //------------------------//
  // Cycle of the candidate //
  //------------------------//

  // User that have connected to website with discord
  GHOST = "ghost",
  // User that have applied to be a candidate
  CANDIDATE = "candidate",
  // When Litopien have vote positive for the candidate
  PRE_ACCEPTED = "pre-accepted",
  // When candidate have been accepted by staff
  PRETOPIEN = "pretopien",
  // When the candidate is in the server for more than 1 month
  LITOPIEN = "litopien",
  // When player is active on the server (more than 4h per week discord or minecraft)
  ACTIVE_LITOPIEN = "active-litopien",
  // When player is inactive on the server (less than 4h per month discord or minecraft)
  INACTIVE_LITOPIEN = "inactive-litopien",

  //-------------------//
  // Utilitarian roles //
  //-------------------//
  BAN="ban",
  REFUSED = "refuse",


  //----------------//
  // Honorary roles //
  //----------------//
  LITOGOD = "litogod", // Managers of the server
  UNIQUE_GOD = "unique-god", // Founders of the server (the two louis)
}

export class UserRolesDTO{
  @ApiProperty({ enum: UserRole, enumName: 'UserRole', isArray: true })
  roles: UserRole[];
}

@Entity()
export class UserEntity {
  @ApiProperty({
    required:true
  })
  @PrimaryColumn({
    type: "varchar",
    length: 32,
    unique: true,
    nullable: false
  })
  discordID: string;

  @ApiProperty({
    type:MinecraftUserEntity,
    required:false,
    nullable:true
  })
  @OneToOne(() => MinecraftUserEntity)
  @JoinColumn()
  minecraftUser:MinecraftUserEntity;

  /**
   * The votes of users to this user
   */
  @OneToMany(() => UserVoteEntity, userVotes => userVotes.votedFor)
  votes: UserVoteEntity[];

  /**
   * The votes of this user to other users
   */
  @OneToMany(() => UserVoteEntity, userVotes => userVotes.voter)
  votedFor: UserVoteEntity[];


  @ApiProperty({
    required:true
  })
  @Column({
    length: 32,
    nullable:false,
  })
  discordNickname: string;

  @ApiProperty()
  @Column( {
    nullable:true,
  })
  discordAvatar: string;

  @ApiProperty({
    enum:UserRole,
    default:UserRole.GHOST,
    required:true
  })
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.GHOST,
    nullable: false
  })
  role: UserRole;

  @ApiProperty({
    minLength: 1024,
    maxLength: 4096
  })
  @Column({nullable:true,type:"text"})
  candidature: string;

  @Column({nullable:true,length:32})
  candidatureDiscordMessageID:string;

  @ApiProperty()
  @Column({nullable:true})
  candidatureProposalAt:Date;

  @ApiProperty()
  @Column({nullable:true})
  candidatureAcceptedAt:Date;

  @ApiProperty()
  @Column('date', { default: () => '(CURRENT_DATE)' , nullable:false})
  lastActivity: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
