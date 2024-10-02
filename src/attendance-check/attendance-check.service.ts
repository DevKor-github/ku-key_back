import { Injectable } from '@nestjs/common';
import { PointService } from './../user/point.service';
import { AttendanceCheckEntity } from 'src/entities/attendance-check.entity';
import { EntityManager, Repository } from 'typeorm';
import { TakeAttendanceResponseDto } from './dto/take-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class AttendanceCheckService {
  constructor(
    private readonly pointService: PointService,
    @InjectRepository(AttendanceCheckEntity)
    private readonly attendanceCheckRepository: Repository<AttendanceCheckEntity>,
  ) {}

  async takeAttendance(
    transactionManager: EntityManager,
    userId: number,
  ): Promise<TakeAttendanceResponseDto> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const koreaTime = new Date(Date.now() + offset);
    const koreaToday = koreaTime.toISOString().split('T')[0];

    // 당일 이미 출석체크를 했는지 확인
    const isAlreadyAttended = await transactionManager.findOne(
      AttendanceCheckEntity,
      {
        where: {
          userId,
          attendanceDate: koreaToday,
        },
      },
    );
    if (isAlreadyAttended) {
      throwKukeyException('ATTENDANCE_ALREADY_CHECKED');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: koreaToday,
      userId,
    });

    await this.pointService.changePoint(
      userId,
      10,
      'Attendance Check Complete!',
      transactionManager,
    );

    await transactionManager.save(attendance);

    return new TakeAttendanceResponseDto(userId, koreaToday, true);
  }

  async isTodayAttendanceChecked(userId: number): Promise<boolean> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const koreaTime = new Date(Date.now() + offset);
    const koreaToday = koreaTime.toISOString().split('T')[0];

    const isAlreadyAttended = await this.attendanceCheckRepository.findOne({
      where: {
        userId,
        attendanceDate: koreaToday,
      },
    });

    return !!isAlreadyAttended;
  }
}
