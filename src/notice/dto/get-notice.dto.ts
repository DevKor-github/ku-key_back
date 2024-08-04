import { ApiProperty } from '@nestjs/swagger';
import { NoticeEntity } from 'src/entities/notice.entity';

export class GetNoticeResponseDto {
  constructor(noticeEntity: NoticeEntity) {
    this.id = noticeEntity.id;
    this.content = noticeEntity.content;
    this.createdAt = noticeEntity.createdAt;
    this.isNew = noticeEntity.isNew;
  }

  @ApiProperty({ description: '알림 고유 ID' })
  id: number;

  @ApiProperty({ description: '알림 내용' })
  content: string;

  @ApiProperty({ description: '알림 시간' })
  createdAt: Date;

  @ApiProperty({ description: '새로운 알림인지 여부' })
  isNew: boolean;
}
