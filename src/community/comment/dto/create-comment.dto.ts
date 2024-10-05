import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '익명 여부' })
  isAnonymous: boolean;
}
