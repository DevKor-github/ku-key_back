import { Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminRequestDto } from 'src/auth/dto/admin-request.dto';

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
}
