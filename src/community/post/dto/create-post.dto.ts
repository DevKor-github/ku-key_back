import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToBoolean } from 'src/decorators/to-boolean.decorator';

export class CreatePostRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsNotEmpty()
  @ToBoolean()
  @ApiProperty({ description: '익명 여부' })
  isAnonymous: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: '첨부 이미지',
  })
  images: any[];
}
