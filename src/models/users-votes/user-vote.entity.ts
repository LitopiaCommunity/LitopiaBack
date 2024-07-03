import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";

export enum VoteType {
  FOR = "for",
  AGAINST = "against",
  ABSTENTION = "abstention"
}

@Entity()
export class UserVoteEntity {
  @PrimaryColumn({type:"character varying",length:32})
  voterID: string;

  @PrimaryColumn({type:"character varying",length:32})
  votedForID: string;

  /**
   * The user who vote
   */
  @ManyToOne(() => UserEntity, user => user.votedFor)
  @JoinColumn({ name: "voterID" })
  voter: UserEntity;


  /**
   * The user who is voted
   */
  @ManyToOne(() => UserEntity, user => user.votes)
  @JoinColumn({ name: "votedForID" })
  votedFor: UserEntity;

  @Column({
    type: "enum",
    enum: VoteType,
    nullable: false,
  })
  vote: VoteType;
}
