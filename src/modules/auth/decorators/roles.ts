import { SetMetadata } from '@nestjs/common';
import { SystemRole, TenantRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const TENANT_ROLES_KEY = 'tenantRoles';
export const ORG_PARAM_KEY = 'orgParam';

export const SystemRoles = (...roles: SystemRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const TenantRoles = (...roles: TenantRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);

export const OrgParam = (paramName: string = 'orgId') =>
  SetMetadata(ORG_PARAM_KEY, paramName);
