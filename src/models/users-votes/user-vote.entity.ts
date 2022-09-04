import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";

enum VoteType {
  FOR = "for",
  AGAINST = "against",
}

@Entity()
export class UserVoteEntity {
  @PrimaryColumn()
  voterID: string;

  @PrimaryColumn()
  votedForID: number;

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