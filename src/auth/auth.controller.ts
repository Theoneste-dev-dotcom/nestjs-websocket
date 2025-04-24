import { Controller, Post, Body, UseGuards,  Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.id, req.body.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  getProfile(@Request() req){
    return req.user;
  }

}