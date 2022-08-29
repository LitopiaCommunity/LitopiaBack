import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

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
export class User {
  @PrimaryColumn({
    type: "char",
    length: 18,
    unique: true,
    nullable: false
  })
  discordID: string;

  @PrimaryColumn({
    type: "uuid",
    unique: true,
    nullable: false
  })
  minecraftUUID: string;

  @Column({
    length: 32,
    nullable: false
  })
  discordNickname: string;

  @Column({
    length: 16,
    nullable: false
  })
  minecraftNickname: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.GHOST,
    nullable: false
  })
  role: UserRole;

  @Column({length:4096,nullable:true})
  candidature: string;

  @Column({nullable:true})
  candidatureProposalAt:Date;

  @Column({nullable:true})
  candidatureAcceptedAt:Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}