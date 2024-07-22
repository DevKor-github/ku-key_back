import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReportEntity } from 'src/entities/report.entity';

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

  async getReportList(): Promise<ReportEntity[]> {
    const reports = await this.find({
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
      throw new BadRequestException('Wrong ReportId!');
    }

    return await this.findOne({
      where: { id: reportId },
      relations: !report.commentId
        ? ['post.postImages', 'post.user']
        : ['comment.user'],
    });
  }
}
