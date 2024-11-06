import { ApiProperty } from '@nestjs/swagger';
import { NoticeEntity } from 'src/entities/notice.entity';
import { Notice } from '../enum/notice.enum';
import {
  CursorPageMetaResponseDto,
  CursorPageResponseDto,
} from 'src/common/dto/CursorPageResponse.dto';

export class NoticeDto {
  constructor(noticeEntity: NoticeEntity) {
    this.id = noticeEntity.id;
    this.content = noticeEntity.content;
    this.createdAt = noticeEntity.createdAt;
    this.isNew = noticeEntity.isNew;
    this.type = noticeEntity.type;
    if (['commentOnPost', 'commentOnComment', 'hotPost'].includes(this.type)) {
      this.handler = noticeEntity.handler;
    }
  }

  @ApiProperty({ description: '알림 고유 ID' })
  id: number;

  @ApiProperty({ description: '알림 내용' })
  content: string;

  @ApiProperty({ description: '알림 시간' })
  createdAt: Date;

  @ApiProperty({ description: '새로운 알림인지 여부' })
  isNew: boolean;

  @ApiProperty({ description: '알림 종류', enum: Notice })
  type: Notice;

  @ApiProperty({ description: '연결 핸들러' })
  handler?: number;
}

export class GetNoticeResponseDto extends CursorPageResponseDto<NoticeDto> {
  @ApiProperty({ type: [NoticeDto], description: '알림 목록' })
  data: NoticeDto[];

  constructor(noticeEntities: NoticeEntity[], meta: CursorPageMetaResponseDto) {
    super(meta);
    this.data = noticeEntities.map(
      (noticeEntity) => new NoticeDto(noticeEntity),
    );
  }
}
