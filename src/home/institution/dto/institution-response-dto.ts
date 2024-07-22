import { ApiProperty } from '@nestjs/swagger';
import { InstitutionEntity } from 'src/entities/institution.entity';

export class InstitutionResponseDto {
  @ApiProperty({ description: '기관 ID' })
  id: number;

  @ApiProperty({ description: '기관명' })
  name: string;

  @ApiProperty({ description: '카테고리' })
  category: string;

  @ApiProperty({ description: '로고 이미지 경로' })
  imgDir: string;

  @ApiProperty({ description: '리다이렉션 링크' })
  linkUrl: string;

  constructor(institution: InstitutionEntity) {
    this.id = institution.id;
    this.name = institution.name;
    this.category = institution.category;
    this.imgDir = institution.imgDir;
    this.linkUrl = institution.linkUrl;
  }
}
