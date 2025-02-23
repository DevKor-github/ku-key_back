import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptReportRequestDto {
  @ApiProperty({ description: '정지 일 수' })
  @IsNotEmpty()
  @IsNumber()
  banDays: number;
}
