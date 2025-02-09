import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetReportResponseDto } from './dto/get-report.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ReportDocs } from 'src/decorators/docs/report.decorator';
import { AcceptReportRequestDto } from 'src/community/report/dto/accept-report.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import {
  CreateReportRequestDto,
  CreateReportResponseDto,
} from 'src/community/report/dto/create-report.dto';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('report')
@ReportDocs
@ApiBearerAuth('accessToken')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(Role.admin)
  @Get()
  async getReportList(): Promise<GetReportListResponseDto[]> {
    return await this.reportService.getReportList();
  }

  @Roles(Role.admin)
  @Get('/:reportId')
  async getReport(
    @Param('reportId') reportId: number,
  ): Promise<GetReportResponseDto> {
    return await this.reportService.getReport(reportId);
  }

  @Post()
  async createReport(
    @User() user: AuthorizedUserDto,
    @Body() body: CreateReportRequestDto,
  ): Promise<CreateReportResponseDto> {
    return await this.reportService.createReport(
      user.id,
      body.reason,
      body.postId,
      body.commentId,
    );
  }

  @Roles(Role.admin)
  @Post('/:reportId/accept')
  @UseInterceptors(TransactionInterceptor)
  async acceptReport(
    @TransactionManager() transactionManager: EntityManager,
    @Param('reportId') reportId: number,
    @Body() body: AcceptReportRequestDto,
  ): Promise<void> {
    await this.reportService.acceptReport(transactionManager, reportId, body);
  }

  @Roles(Role.admin)
  @Post('/:reportId/reject')
  async rejectReport(@Param('reportId') reportId: number): Promise<void> {
    await this.reportService.rejectReport(reportId);
  }
}
