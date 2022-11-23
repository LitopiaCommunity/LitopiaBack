import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UsersService } from "../models/users/users.service";
import { UserEntity, UserRole } from "../models/users/user.entity";
import * as moment from "moment";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private userService:UsersService) {
  }

  @Cron("30 22 * * *")
  async dailyAction(){
    await this.updatePretopien();
    await this.updateLitopien();
  }

  async updatePretopien(){
    const userList = await this.userService.getAllUsersWithRoles([UserRole.PRETOPIEN])
    this.logger.log("SCHEDULE TASK IS RUNNING TO UPDATE "+userList.length+" PRETOPIEN")
    for (const user of userList) {
      const acceptedAt = moment(user.candidatureAcceptedAt)
      const lastUpdate = moment(user.updatedAt)
      //We can pass pretopien to litopien if member has been active in the last 7 day
      //and is in the server for more than 1 month
      if (moment().diff(acceptedAt,'months')>1 && moment().diff(lastUpdate,'days')<7){
        await this.userService.updateRole(user,UserRole.LITOPIEN);
        this.logger.log(user.discordNickname+" is now a real Litopien");
      }
    }
  }

  async updateLitopien(){
    const userList = await this.userService.getAllUsersWithRoles([UserRole.LITOPIEN,UserRole.ACTIVE_LITOPIEN,UserRole.INACTIVE_LITOPIEN])
    this.logger.log("SCHEDULE TASK IS RUNNING TO UPDATE "+userList.length+" LITOPIEN")
    userList.forEach((user:UserEntity)=>{
      const lastUpdate = moment(user.updatedAt)
      if (moment().diff(lastUpdate,'month')>=1){
        this.logger.log(user.discordNickname+" is now a an inactive Litopien");
        //if (user.role!==UserRole.INACTIVE_LITOPIEN)
          this.userService.updateRole(user,UserRole.INACTIVE_LITOPIEN);
        return;
      }else if (moment().diff(lastUpdate,'days')<4){
        //if (user.role!==UserRole.ACTIVE_LITOPIEN)
          this.userService.updateRole(user,UserRole.ACTIVE_LITOPIEN);
        this.logger.log(user.discordNickname+" is now an active Litopien");
        return;
      }else if (moment().diff(lastUpdate,'days')>7){
        //if (user.role!==UserRole.LITOPIEN)
          this.userService.updateRole(user,UserRole.LITOPIEN);
        this.logger.log(user.discordNickname+" is now a an regular Litopien");
        return;
      }
    })
  }
}
