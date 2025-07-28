import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from '@prisma/client';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Пользователь не найден в запросе');
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('У вас нет прав для этого действия');
    }
    return true;
  }
}
