import { ConflictException, Injectable } from '@nestjs/common';
import { AttendanceCheckEntity } from 'src/entities/attendance-check.entity';
import { EntityManager } from 'typeorm';
import { TakeAttendanceResponseDto } from './dto/take-attendance.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AttendanceCheckService {
  constructor(private readonly userService: UserService) {}

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
      throw new ConflictException('Already attended');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: koreaToday,
      userId,
    });

    await this.userService.changePoint(
      userId,
      10,
      'Attendance Check Complete!',
      transactionManager,
    );

    await transactionManager.save(attendance);

    return new TakeAttendanceResponseDto(userId, koreaToday, true);
  }
}
