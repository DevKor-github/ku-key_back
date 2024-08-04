import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { GetNoticeResponseDto } from 'src/notice/dto/get-notice.dto';

@ApiExtraModels(GetNoticeResponseDto)
export class CursorPageMetaResponseDto {
  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextData: boolean;
  @ApiProperty({
    description: '다음페이지 조회용 커서, 다음페이지 없으면 null',
  })
  nextCursor: string;
}

export class CursorPageResponseDto<T> {
  @ApiProperty({
    description: '다음 페이지 존재 여부',
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(GetNoticeResponseDto) }],
    },
  })
  data: T[];

  @ApiProperty({ description: '페이징 관련 메타데이터' })
  meta: CursorPageMetaResponseDto;
}
