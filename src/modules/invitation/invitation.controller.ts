import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantRoles } from '../auth/decorators/roles';
import { TenantRole } from '@prisma/client';
import { OrgMemberGuard } from '../auth/guards/org-member-guard';
import { TenantRolesGuard } from '../auth/guards/tenant-roles-guard';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiBearerAuth('access-token')
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiOperation({ summary: 'Отправить приглашение в организацию' })
  @UseGuards(JwtAuthGuard, OrgMemberGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @Post('organizations/:orgId/invitations')
  async send(
    @Req() req,
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.sendInvitation(req.user.id, orgId, dto);
  }

  @ApiOperation({ summary: 'Принять приглашение' })
  @UseGuards(JwtAuthGuard)
  @Post('organizations/invitations/accept')
  async accept(@Req() req, @Body() dto: AcceptInvitationDto) {
    return this.invitationService.acceptInvitation(req.user.id, dto);
  }
}
