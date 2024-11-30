import { ApiProperty } from '@nestjs/swagger';

export class CursorPageMetaResponseDto {
  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextData: boolean;
  @ApiProperty({
    description: '다음페이지 조회용 커서, 다음페이지 없으면 null',
  })
  nextCursor: string;
}

export class CursorPageResponseDto<T> {
  constructor(meta: CursorPageMetaResponseDto) {
    this.meta = meta;
  }

  data: T[];

  @ApiProperty({ description: '페이징 관련 메타데이터' })
  meta: CursorPageMetaResponseDto;
}
