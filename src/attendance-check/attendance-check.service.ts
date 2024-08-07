import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceCheckEntity } from 'src/entities/attendance-check.entity';
import { EntityManager, Repository } from 'typeorm';
import {
  TakeAttendanceRequestDto,
  TakeAttendanceResponseDto,
} from './dto/take-attendance.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AttendanceCheckService {
  constructor(
    @InjectRepository(AttendanceCheckEntity)
    private readonly attendanceCheckRepository: Repository<AttendanceCheckEntity>,
    private readonly userService: UserService,
  ) {}

  async takeAttendance(
    transactionManager: EntityManager,
    userId: number,
    takeAttendanceRequestDto: TakeAttendanceRequestDto,
  ): Promise<TakeAttendanceResponseDto> {
    const offset = 1000 * 60 * 60 * 9; // 9시간 밀리세컨트 값
    const koreaTime = new Date(Date.now() + offset);
    const koreaToday = koreaTime.toISOString().split('T')[0];

    if (koreaToday !== takeAttendanceRequestDto.attendanceDate) {
      throw new ForbiddenException('Only today is available');
    }

    // 이미 출석체크를 했는지 확인
    const isAlreadyAttended = await transactionManager.findOne(
      AttendanceCheckEntity,
      {
        where: {
          userId,
          attendanceDate: takeAttendanceRequestDto.attendanceDate,
        },
      },
    );

    if (isAlreadyAttended) {
      throw new ForbiddenException('Already attended');
    }

    const attendance = transactionManager.create(AttendanceCheckEntity, {
      attendanceDate: takeAttendanceRequestDto.attendanceDate,
      userId,
    });

    await this.userService.changePoint(
      userId,
      10,
      'Attendance Check Complete!',
      transactionManager,
    );
    await transactionManager.save(attendance);

    return new TakeAttendanceResponseDto(
      userId,
      takeAttendanceRequestDto.attendanceDate,
      true,
    );
  }
}
