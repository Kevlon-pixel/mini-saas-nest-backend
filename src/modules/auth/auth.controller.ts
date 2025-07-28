import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-guard';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Аутентификация и авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Подтверждение e‑mail' })
  async verify(@Res({ passthrough: true }) res, @Body() dto: VerifyEmailDto) {
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.verifyEmail(dto.token);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: expiresAt.getTime() - Date.now(),
    });
    return { accessToken };
  }

  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @Post('login')
  async login(@Res({ passthrough: true }) res, @Body() dto: LoginDto) {
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.login(dto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: expiresAt.getTime() - Date.now(),
    });
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Выход пользователя' })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res, @Req() req) {
    const userId = req.user.id;
    await this.authService.logout(req.sub);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
    });

    return { message: 'Пользователь успешно вышел' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновление refresh токена' })
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) {
      throw new UnauthorizedException('Нет refresh токена в куки');
    }
    const { accessToken, refreshToken, expiresAt } =
      await this.authService.refresh(oldToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: expiresAt.getTime() - Date.now(),
    });
    return { accessToken };
  }
}
