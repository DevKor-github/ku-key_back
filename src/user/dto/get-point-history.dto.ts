import { ApiProperty } from '@nestjs/swagger';

export class GetPointHistoryResponseDto {
  constructor(
    date: Date,
    history: string,
    changePoint: number,
    resultPoint: number,
  ) {
    this.date = date;
    this.history = history;
    this.changePoint = changePoint;
    this.resultPoint = resultPoint;
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
