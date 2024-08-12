import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetReportResponseDto } from './dto/get-report.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(Role.admin)
  @Get()
  @ApiOperation({
    summary: '신고 목록 조회',
    description: '신고 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '신고 목록 조회 성공',
    type: [GetReportListResponseDto],
  })
  async getReportList(): Promise<GetReportListResponseDto[]> {
    return await this.reportService.getReportList();
  }

  @Roles(Role.admin)
  @Post('/:reportId')
  @ApiOperation({
    summary: '신고 세부내용 조회',
    description: '신고 세부내용을 조회합니다.',
  })
  @ApiParam({
    name: 'reportId',
    description: '신고 고유 ID',
  })
  @ApiResponse({
    status: 201,
    description: '신고 목록 조회 성공',
    type: GetReportResponseDto,
  })
  async getReport(
    @Param('reportId') reportId: number,
  ): Promise<GetReportResponseDto> {
    return await this.reportService.getReport(reportId);
  }
}
