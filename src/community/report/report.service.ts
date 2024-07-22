import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportResponseDto } from './dto/create-report.dto';
import { GetReportListResponseDto } from './dto/get-report-list.dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(
    reporterId: number,
    reason: string,
    postId: number,
    commentId?: number,
  ): Promise<CreateReportResponseDto> {
    await this.reportRepository.createReport(
      reporterId,
      reason,
      postId,
      commentId,
    );
    return new CreateReportResponseDto(true);
  }

  async getReportList(): Promise<GetReportListResponseDto[]> {
    const reports = await this.reportRepository.getReports();
    return reports.map((report) => new GetReportListResponseDto(report));
  }
}
