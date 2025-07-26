import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: { sub: number; jti: string; role: string }) {
    const user = await this.userRepository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
