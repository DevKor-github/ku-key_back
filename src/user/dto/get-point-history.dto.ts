import { ApiProperty } from '@nestjs/swagger';
import { PointHistoryEntity } from 'src/entities/point-history.entity';

export class GetPointHistoryResponseDto {
  constructor(pointHistoryEntity: PointHistoryEntity) {
    this.date = pointHistoryEntity.createdAt;
    this.history = pointHistoryEntity.history;
    this.changePoint = pointHistoryEntity.changePoint;
    this.resultPoint = pointHistoryEntity.resultPoint;
  }

  @ApiProperty({ description: '일시' })
  date: Date;

  @ApiProperty({ description: '내역' })
  history: string;

  @ApiProperty({ description: '변경 포인트' })
  changePoint: number;

  @ApiProperty({ description: '결과 포인트' })
  resultPoint: number;
}
