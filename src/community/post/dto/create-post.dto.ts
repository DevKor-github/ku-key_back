import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '익명 여부' })
  isAnonymous: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: '첨부 이미지',
  })
  images: any[];
}
