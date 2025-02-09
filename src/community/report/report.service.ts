import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportResponseDto } from './dto/create-report.dto';
import { GetReportListResponseDto } from './dto/get-report-list.dto';
import { GetReportResponseDto } from './dto/get-report.dto';
import { FileService } from 'src/common/file.service';
import { throwKukeyException } from 'src/utils/exception.util';
import { UserBanService } from 'src/user/user-ban.service';
import { AcceptReportRequestDto } from 'src/community/report/dto/accept-report.dto';
import { PostService } from 'src/community/post/post.service';
import { CommentService } from 'src/community/comment/comment.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly fileService: FileService,
    private readonly userBanService: UserBanService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async createReport(
    userId: number,
    reason: string,
    postId: number,
    commentId?: number,
  ): Promise<CreateReportResponseDto> {
    if (
      await this.reportRepository.checkAlreadyReport(userId, postId, commentId)
    ) {
      throwKukeyException('ALREADY_REPORTED');
    }
    if (!(await this.postService.isExistingPostId(postId))) {
      throwKukeyException('POST_NOT_FOUND');
    }
    if (commentId && !(await this.commentService.getComment(commentId))) {
      throwKukeyException('COMMENT_NOT_FOUND');
    }

    await this.reportRepository.createReport(userId, reason, postId, commentId);
    return new CreateReportResponseDto(true);
  }

  async getReportList(): Promise<GetReportListResponseDto[]> {
    const reports = await this.reportRepository.getReportList();
    console.log(reports);
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

  async acceptReport(
    transactionManager: EntityManager,
    reportId: number,
    dto: AcceptReportRequestDto,
  ): Promise<void> {
    const report = await this.reportRepository.getReport(reportId);
    const isComment = report.commentId ? true : false;
    const userId = isComment ? report.comment.userId : report.post.userId;
    if (userId) {
      await this.userBanService.banUser(
        transactionManager,
        userId,
        report.reason,
        dto.banDays,
      );
    }
    if (isComment) {
      await this.commentService.deleteComment(
        transactionManager,
        { id: userId, username: '' },
        report.commentId,
      );
    } else {
      await this.postService.deletePost(
        transactionManager,
        { id: userId, username: '' },
        report.postId,
      );
    }
    await this.reportRepository.acceptReport(reportId);
  }

  async rejectReport(reportId: number): Promise<void> {
    await this.reportRepository.acceptReport(reportId);
  }
}
