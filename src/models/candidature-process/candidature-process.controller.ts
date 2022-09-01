import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedGuard } from "../../auth/guards/authenticated.guard";
import { Request, Response } from "express";
import { UserEntity } from "../users/user.entity";
import { CandidaturePostDto } from "./dto/candidature-post.dto";
import { CandidatureProcessService } from "./candidature-process.service";

@ApiTags("candidature-process")
@Controller("api/candidature-process")
export class CandidatureProcessController {

  constructor(private candidatureService: CandidatureProcessService) {
  }

  @Post("candidature")
  @ApiCookieAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiResponse({ status: 403, description: "Forbidden cause you are not connected" })
  public async postCandidature(@Req() req: Request, @Res() res: Response, @Body() candidature: CandidaturePostDto) {
    const user = <UserEntity>req.user;
    const newUser = await this.candidatureService.postCandidature(user, candidature);
    if (!(newUser instanceof UserEntity)) {
      return res.status(newUser.code).json(newUser);
    }
    return res.status(200).json(newUser);
  }
}
