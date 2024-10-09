import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetReportResponseDto } from './dto/get-report.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ReportDocs } from 'src/decorators/docs/report.decorator';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('report')
@ReportDocs
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(Role.admin)
  @Get()
  async getReportList(): Promise<GetReportListResponseDto[]> {
    return await this.reportService.getReportList();
  }

  @Roles(Role.admin)
  @Post('/:reportId')
  async getReport(
    @Param('reportId') reportId: number,
  ): Promise<GetReportResponseDto> {
    return await this.reportService.getReport(reportId);
  }
}
