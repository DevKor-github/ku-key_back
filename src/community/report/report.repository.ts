import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import { ReportEntity } from 'src/entities/report.entity';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class ReportRepository extends Repository<ReportEntity> {
  constructor(dataSource: DataSource) {
    super(ReportEntity, dataSource.createEntityManager());
  }

  async createReport(
    reporterId: number,
    reason: string,
    postId: number,
    commentId?: number,
  ): Promise<ReportEntity> {
    const report = this.create({
      reporterId: reporterId,
      postId: postId,
      reason: reason,
    });
    if (commentId) {
      report.commentId = commentId;
    }
    return await this.save(report);
  }

  async checkAlreadyReport(
    reporterId: number,
    postId: number,
    commentId?: number,
  ): Promise<boolean> {
    const report = await this.findOne({
      where: commentId
        ? { reporterId: reporterId, commentId: commentId }
        : { reporterId: reporterId, postId: postId, commentId: IsNull() },
    });

    return report ? true : false;
  }

  async getReportList(): Promise<ReportEntity[]> {
    const reports = await this.find({
      where: {
        isAccepted: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return reports;
  }

  async getReport(reportId: number): Promise<ReportEntity> {
    const report = await this.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throwKukeyException('REPORT_NOT_FOUND');
    }

    return await this.findOne({
      where: { id: reportId },
      relations: !report.commentId
        ? ['post.postImages', 'post.user']
        : ['comment.user'],
    });
  }

  async getPostReportCount(postId: number): Promise<number> {
    return await this.count({
      where: {
        postId: postId,
        commentId: IsNull(),
      },
    });
  }

  async getCommentReportCount(commentId: number): Promise<number> {
    return await this.count({
      where: {
        commentId: commentId,
      },
    });
  }

  async acceptReport(reportId: number): Promise<void> {
    const report = await this.getReport(reportId);
    if (report.commentId) {
      await this.update({ commentId: report.commentId }, { isAccepted: true });
    } else {
      await this.update(
        { postId: report.postId, commentId: IsNull() },
        { isAccepted: true },
      );
    }
  }
}
