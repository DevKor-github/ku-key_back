import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstitutionRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '기관명' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '카테고리' })
  category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '로고 이미지 경로' })
  imgDir: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '리다이렉션 링크' })
  linkUrl: string;
}
