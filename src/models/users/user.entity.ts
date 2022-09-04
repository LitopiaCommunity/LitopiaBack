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

export enum UserRole {
  GHOST = "ghost",
  CANDIDATE = "candidate",
  BAN="ban",
  REFUSED = "refuse",
  LITOPIEN = "litopien",
  ACTIVE_LITOPIEN = "active litopien",
  INACTIVE_LITOPIEN = "inactive litopien",
  LITOGOD = "litogod",
  UNIQUE_GOD = "unique god",
}

@Entity()
export class UserEntity {
  @ApiProperty({
    required:true
  })
  @PrimaryColumn({
    type: "char",
    length: 18,
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
  @Column({length:4096,nullable:true})
  candidature: string;

  @ApiProperty()
  @Column({nullable:true})
  candidatureProposalAt:Date;

  @ApiProperty()
  @Column({nullable:true})
  candidatureAcceptedAt:Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}