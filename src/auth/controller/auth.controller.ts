import { Controller, Get, HttpException, HttpStatus, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DiscordAuthGuard } from "../guards/discord-auth.guard";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { UserEntity } from "../../models/users/user.entity";

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  /**
   * GET /api/auth/login
   * This is the route the user will visit to authenticate
   */
  @Get('login')
  @ApiOperation({
    summary: 'This is the route the user will visit to authenticate. ' +
      'It need to be open in browser (not fetch) cause it will redirect to discord login view.'
  })
  @UseGuards(DiscordAuthGuard)
  login() {
    return;
  }

  /**
   * GET /api/auth/redirect
   * This is the redirect URL the OAuth2 Provider will call.
   */
  @Get('redirect')
  @ApiOperation({
    summary: 'This is the redirect URL the OAuth2 Provider will call. ' +
      'It need to be open in browser (not fetch) and it will automatically close window.'
  })
  @UseGuards(DiscordAuthGuard)
  redirect(@Res() res: Response) {
    res.status(200).send(`
      <script>
        setTimeout(function() {
            window.close()
        }, 100);
      </script>`)
  }

  /**
   * GET /api/auth/status
   * Retrieve the auth status
   */
  @Get('status')
  @ApiCookieAuth()
  @ApiOperation({summary: 'Retrieve the authentified user.'})
  @ApiResponse({ status: 200, description: 'Get auth guard',type:UserEntity})
  @ApiResponse({ status: 403, description: 'Forbidden cause you are not connected'})
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request):UserEntity {
    return <UserEntity>req.user;
  }

  /**
   * GET /api/auth/logout
   * Logging the user out
   */
  @Get('logout')
  @ApiCookieAuth()
  @ApiOperation({summary: 'To logout the authentified user.'})
  @ApiResponse({ status: 200, description: 'Logout successful'})
  @ApiResponse({ status: 400, description: 'Can not logout if you are not login'})
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: Request,@Res() res:Response) {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          throw new HttpException('Unable to log out', HttpStatus.BAD_REQUEST);
        } else {
          res.status(200).send({statusCode:200,message:'Logout successful'})
        }
      });
    } else {
      res.end()
      res.status(200).send({statusCode:200,message:'No sessions'})
    }
  }
}
