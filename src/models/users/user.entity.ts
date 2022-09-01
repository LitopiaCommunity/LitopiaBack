import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum UserRole {
  GHOST = "ghost",
  CANDIDATE = "CANDIDATE",
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

  @ApiProperty()
  @Column({
    nullable: true
  })
  minecraftUUID: string;

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

  @ApiProperty()
  @Column({
    length: 16,
    nullable: true
  })
  minecraftNickname: string;

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
    maxLength:4096
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