import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRequestDto } from 'src/auth/dto/admin-request.dto';
import { GetReportResponseDto } from './dto/get-report.dto';

@Controller('report')
@UseGuards(AdminAuthGuard)
@ApiTags('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({
    summary: '신고 목록 조회',
    description: '신고 목록을 조회합니다.',
  })
  @ApiBody({
    type: AdminRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '신고 목록 조회 성공',
    type: [GetReportListResponseDto],
  })
  async getReportList(): Promise<GetReportListResponseDto[]> {
    return await this.reportService.getReportList();
  }

  @Post('/:reportId')
  @ApiOperation({
    summary: '신고 세부내용 조회',
    description: '신고 세부내용을 조회합니다.',
  })
  @ApiBody({
    type: AdminRequestDto,
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
