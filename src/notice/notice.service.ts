import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { filter, map, Observable, Subject } from 'rxjs';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { NoticeEntity } from 'src/entities/notice.entity';
import { EntityManager, LessThanOrEqual, Repository } from 'typeorm';
import { GetNoticeResponseDto } from './dto/get-notice.dto';
import { Notice } from './enum/notice.enum';
import { CursorPageOptionsDto } from 'src/common/dto/CursorPageOptions.dto';
import { CursorPageMetaResponseDto } from 'src/common/dto/CursorPageResponse.dto';

interface user {
  userId: number;
  message: string;
}

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(NoticeEntity)
    private readonly noticeRepository: Repository<NoticeEntity>,
  ) {}
  private users$: Subject<user> = new Subject();

  private observer = this.users$.asObservable();

  async emitNotice(
    userId: number,
    message: string,
    type: Notice,
    handler?: number,
    transactionManager?: EntityManager,
  ) {
    const notice = this.noticeRepository.create({
      userId: userId,
      content: message,
      type: type,
    });
    if (handler) notice.handler = handler;

    transactionManager
      ? await transactionManager.save(notice)
      : await this.noticeRepository.save(notice);
    this.users$.next({ userId: userId, message: message });
  }

  sendClientConnection(userId: number): Observable<MessageEvent> {
    return this.observer.pipe(
      filter((user) => Number(user.userId) === Number(userId)),
      map((user) => {
        return {
          data: {
            message: user.message,
          },
        } as MessageEvent;
      }),
    );
  }

  async getNotices(
    user: AuthorizedUserDto,
    pageOption: CursorPageOptionsDto,
  ): Promise<GetNoticeResponseDto> {
    const cursor = new Date('9999-12-31');
    if (pageOption.cursor) {
      cursor.setTime(Number(pageOption.cursor));
    }
    const take = pageOption.take;

    const notices = await this.noticeRepository.find({
      where: {
        userId: user.id,
        createdAt: LessThanOrEqual(cursor),
      },
      order: {
        createdAt: 'DESC',
      },
      take: take + 1,
    });

    const lastData = notices.length > take ? notices.pop() : null;
    const meta: CursorPageMetaResponseDto = {
      hasNextData: lastData ? true : false,
      nextCursor: lastData
        ? (lastData.createdAt.getTime() + 1).toString().padStart(14, '0')
        : null,
    };
    const result = new GetNoticeResponseDto(notices, meta);

    await this.noticeRepository.update({ userId: user.id }, { isNew: false });

    return result;
  }
}
