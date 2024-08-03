import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '신고 사유' })
  reason: string;
}

export class CreateReportResponseDto {
  constructor(isReported: boolean) {
    this.isReported = isReported;
  }
  @ApiProperty({ description: '신고 처리 여부' })
  isReported: boolean;
}
