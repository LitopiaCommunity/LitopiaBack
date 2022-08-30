import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SessionEntity } from "./session.entity";
import { ISession } from "connect-typeorm";

@Injectable()
export class SessionsService {
  //Juste provide a repository for store: new TypeormStore().connect()
  constructor(
    @InjectRepository(SessionEntity)
    public sessionsRepository: Repository<ISession>,
  ) {}
}
