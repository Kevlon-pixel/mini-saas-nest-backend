import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Observable } from 'rxjs';

@Injectable()
export class OrgMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const orgId = req.params.id;

    if (!user || !user.userId) {
      throw new ForbiddenException('Пользователь не аутентифицирован');
    }
    if (!orgId) {
      throw new ForbiddenException('Id организации нет в запросе');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.userId,
          organizationId: orgId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('вы не член организации');
    }

    req.organizationRole = membership.role;
    return true;
  }
}
