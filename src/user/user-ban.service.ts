import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBanEntity } from 'src/entities/user-ban.entity';
import { Notice } from 'src/notice/enum/notice.enum';
import { NoticeService } from 'src/notice/notice.service';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class UserBanService {
  constructor(
    @InjectRepository(UserBanEntity)
    private readonly userBanRepository: Repository<UserBanEntity>,
    private readonly noticeService: NoticeService,
  ) {}

  async banUser(
    userId: number,
    reason: string,
    expireDays: number,
  ): Promise<void> {
    const bannedAt = new Date();
    const expiredAt = new Date(
      bannedAt.getTime() + expireDays * 24 * 60 * 60 * 1000,
    );

    await this.userBanRepository.save({
      userId,
      bannedAt,
      expiredAt,
      reason,
    });

    // 알림 발송
    await this.noticeService.emitNotice(
      userId,
      'You have been banned!',
      Notice.ban,
      null,
      null,
    );
  }

  async checkUserBan(userId: number): Promise<boolean> {
    const userBan = await this.userBanRepository.findOne({
      where: {
        userId,
        expiredAt: MoreThanOrEqual(new Date()),
      },
    });

    return !!userBan;
  }
}
