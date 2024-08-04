import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { filter, map, Observable, Subject } from 'rxjs';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { NoticeEntity } from 'src/entities/notice.entity';
import { Repository } from 'typeorm';
import { GetNoticeResponseDto } from './dto/get-notice.dto';

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

  async emitNotice(userId: number, message: string) {
    const notice = this.noticeRepository.create({
      userId: userId,
      content: message,
    });
    await this.noticeRepository.save(notice);
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

  async getNotices(user: AuthorizedUserDto): Promise<GetNoticeResponseDto[]> {
    const notices = await this.noticeRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    const result: GetNoticeResponseDto[] = notices.map(
      (notice) => new GetNoticeResponseDto(notice),
    );

    await this.noticeRepository.update({ userId: user.id }, { isNew: false });

    return result;
  }
}
