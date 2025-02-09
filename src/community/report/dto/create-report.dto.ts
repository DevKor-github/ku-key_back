import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportRequestDto {
  @ApiProperty({ description: '게시글 ID' })
  @IsNotEmpty()
  @IsNumber()
  postId: number;

  @ApiPropertyOptional({
    description: '댓글 ID (댓글 신고일 경우 존재, 게시글 신고일 경우 null',
  })
  @IsOptional()
  @IsNumber()
  commentId?: number;

  @ApiProperty({ description: '신고 사유' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class CreateReportResponseDto {
  constructor(isReported: boolean) {
    this.isReported = isReported;
  }
  @ApiProperty({ description: '신고 처리 여부' })
  isReported: boolean;
}
