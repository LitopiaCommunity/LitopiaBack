import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../users/user.entity";
import { IsUUID } from 'class-validator';

@Entity()
export class MinecraftUserEntity {
  @IsUUID()
  @ApiProperty({
    required: true,
  })
  @PrimaryColumn({
    type:"uuid",
    unique:true,
    nullable:false
  })
  minecraftUUID: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user:UserEntity;

  @ApiProperty()
  @Column({
    length: 16,
    nullable: true
  })
  minecraftNickname: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}