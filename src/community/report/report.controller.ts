import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('report')
@ReportDocs
@ApiBearerAuth('accessToken')
@Roles(Role.admin)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getReportList(): Promise<GetReportListResponseDto[]> {
    return await this.reportService.getReportList();
  }

  @Post('/:reportId')
  async getReport(
    @Param('reportId') reportId: number,
  ): Promise<GetReportResponseDto> {
    return await this.reportService.getReport(reportId);
  }

  @Post('/:reportId/accept')
  async acceptReport(
    @Param('reportId') reportId: number,
    @Body() body: AcceptReportRequestDto,
  ): Promise<void> {
    await this.reportService.acceptReport(reportId, body);
  }

  @Post('/:reportId/reject')
  async rejectReport(@Param('reportId') reportId: number): Promise<void> {
    await this.reportService.rejectReport(reportId);
  }
}
