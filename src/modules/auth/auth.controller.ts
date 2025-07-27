import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Аутентификация и авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
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
      maxAge: expiresAt,
    });
    return { accessToken };
  }
}
