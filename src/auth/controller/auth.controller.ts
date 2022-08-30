import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DiscordAuthGuard } from "../guards/discord-auth.guard";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { User } from "../../models/users/user.entity";

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
      'It need to be open in browser (not fetch) cause it will redirect the last opened page.'
  })
  @UseGuards(DiscordAuthGuard)
  redirect(@Res() res: Response) {
    res.status(200).send('Login successful')
  }

  /**
   * GET /api/auth/status
   * Retrieve the auth status
   */
  @Get('status')
  @ApiCookieAuth()
  @ApiOperation({summary: 'Retrieve the authentified user.'})
  @ApiResponse({ status: 200, description: 'Get auth guard',type:User})
  @ApiResponse({ status: 403, description: 'Forbidden cause you are not connected'})
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request):User {
    return <User>req.user;
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
          res.status(400).send('Unable to log out')
        } else {
          res.status(200).send('Logout successful')
        }
      });
    } else {
      res.end()
    }
  }
}
