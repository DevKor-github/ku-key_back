import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBannerRequestDto {
  @ApiProperty({
    description: '배너 이미지 파일',
    type: 'string',
    format: 'binary',
  })
  image: any;

  @ApiProperty({ description: '배너 제목' })
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '링크' })
  @IsOptional()
  link?: string;
}
