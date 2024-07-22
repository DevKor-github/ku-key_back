import { Injectable } from '@nestjs/common';
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

  async getReports(): Promise<ReportEntity[]> {
    const reports = await this.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return reports;
  }
}
