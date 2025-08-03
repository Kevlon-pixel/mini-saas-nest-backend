// auth/tenant-roles.guard.ts
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';
import { TenantRole } from '@prisma/client';
import { ORG_PARAM_KEY, TENANT_ROLES_KEY } from '../decorators/roles';

@Injectable()
export class TenantRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<TenantRole[]>(
      TENANT_ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userId = Number(req.user?.id);
    if (!Number.isInteger(userId)) {
      throw new ForbiddenException('Пользователь не найден в запросе');
    }

    const orgParam =
      this.reflector.getAllAndOverride<string>(ORG_PARAM_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? 'orgId';

    const organizationId = Number(
      req.params?.[orgParam] ?? req.body?.organizationId,
    );
    if (!Number.isInteger(organizationId)) {
      throw new BadRequestException(
        `Не передан идентификатор организации (${orgParam})`,
      );
    }

    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('Вы не состоите в организации');
    }

    if (!required.includes(membership.role)) {
      throw new ForbiddenException('Недостаточно прав');
    }
    
    req.membership = membership;
    return true;
  }
}
