import { Controller, Post, Get, Delete, Body, Res, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, accessToken, user } = await this.authService.register(dto);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, accessToken, user } = await this.authService.login(dto);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user, accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() userPayload: { sub: string; rawToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, user } = await this.authService.refresh(
      userPayload.sub,
      userPayload.rawToken,
    );
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user, accessToken };
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() userPayload: { sub: string; rawToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userPayload.sub, userPayload.rawToken);
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Delete('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out from all devices' };
  }
  @Get('google')
@UseGuards(GoogleAuthGuard)
googleAuth() {}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(
  @CurrentUser() googleUser: any,
  @Res() res: Response,
) {
  const { refreshToken, accessToken } = await this.authService.googleLogin(googleUser);
  res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.redirect(`${process.env.FRONTEND_URL}/?token=${accessToken}`);
}
}
