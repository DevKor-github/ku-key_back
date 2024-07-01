import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '익명 여부' })
  isAnonymous: boolean;
}
