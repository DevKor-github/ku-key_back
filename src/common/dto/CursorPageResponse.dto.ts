import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  PostPreview,
  PostPreviewWithBoardName,
} from 'src/community/post/dto/post-preview.dto';
import { GetNoticeResponseDto } from 'src/notice/dto/get-notice.dto';

@ApiExtraModels(GetNoticeResponseDto, PostPreview, PostPreviewWithBoardName)
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
    description: '데이터 목록',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(GetNoticeResponseDto) },
        { $ref: getSchemaPath(PostPreview) },
        { $ref: getSchemaPath(PostPreviewWithBoardName) },
      ],
    },
  })
  data: T[];

  @ApiProperty({ description: '페이징 관련 메타데이터' })
  meta: CursorPageMetaResponseDto;
}
