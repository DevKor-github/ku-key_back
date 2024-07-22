import { ApiProperty } from '@nestjs/swagger';
import { ReportEntity } from 'src/entities/report.entity';

export class GetReportListResponseDto {
  constructor(reportEntity: ReportEntity) {
    this.id = reportEntity.id;
    this.createdAt = reportEntity.createdAt;
    this.reason = reportEntity.reason;
  }
  @ApiProperty({ description: '신고 고유 ID' })
  id: number;

  @ApiProperty({ description: '신고 일시' })
  createdAt: Date;

  @ApiProperty({ description: '신고 사유' })
  reason: string;
}
