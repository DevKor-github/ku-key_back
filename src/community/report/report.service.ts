import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportResponseDto } from './dto/create-report.dto';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { GetReportResponseDto } from './dto/get-report.dto';
import { FileService } from 'src/common/file.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly fileService: FileService,
  ) {}

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
    const reports = await this.reportRepository.getReportList();
    return reports.map((report) => new GetReportListResponseDto(report));
  }

  async getReport(reportId: number): Promise<GetReportResponseDto> {
    const report = await this.reportRepository.getReport(reportId);
    const count = report.commentId
      ? await this.reportRepository.getCommentReportCount(report.commentId)
      : await this.reportRepository.getPostReportCount(report.postId);
    const response = new GetReportResponseDto(report, count);
    if (response.reportedPost) {
      response.reportedPost.imgDirs = response.reportedPost.imgDirs.map(
        (imgDir) => this.fileService.makeUrlByFileDir(imgDir),
      );
    }

    return response;
  }
}
