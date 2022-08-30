import { ISession } from 'connect-typeorm';
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

//It maybe will be used when I can store those sessions :/
@Entity({ name: 'sessions' })
export class SessionEntity implements ISession {
  @Index()
  @Column('bigint')
  expiredAt: number;

  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('text')
  json: string;

  @DeleteDateColumn()
  deleteAt:Date
}