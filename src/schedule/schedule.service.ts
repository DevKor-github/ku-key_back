import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { TimetableService } from 'src/timetable/timetable.service';
import { DeleteScheduleResponseDto } from './dto/delete-schedule-response.dto';
import { UpdateScheduleRequestDto } from './dto/update-schedule-request.dto';
import { UpdateScheduleResponseDto } from './dto/update-schedule-response.dto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isConflictingTime } from 'src/utils/time-utils';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
    @Inject(forwardRef(() => TimetableService))
    private readonly timetableService: TimetableService,
  ) {}

  async getScheduleByTimetableId(
    timetableId: number,
  ): Promise<ScheduleEntity[]> {
    return await this.scheduleRepository.find({ where: { timetableId } });
  }

  async createSchedule(
    createScheduleRequestDto: CreateScheduleRequestDto,
    user: AuthorizedUserDto,
  ): Promise<ScheduleEntity> {
    const timetable =
      await this.timetableService.getSimpleTimetableByTimetableId(
        createScheduleRequestDto.timetableId,
        user.id,
      );
    if (!timetable) {
      throwKukeyException('TIMETABLE_NOT_FOUND');
    }

    if (
      createScheduleRequestDto.startTime >= createScheduleRequestDto.endTime
    ) {
      throwKukeyException('INVALID_TIME_RANGE');
    }

    // 시간표에 존재하는 강의, 스케쥴과 추가하려는 스케쥴이 시간이 겹치는 지 확인
    const isConflict = await this.checkTimeConflict(createScheduleRequestDto);

    if (isConflict) {
      throwKukeyException('SCHEDULE_CONFLICT');
    }

    const newSchedule = this.scheduleRepository.create({
      ...createScheduleRequestDto,
    });

    return await this.scheduleRepository.save(newSchedule);
  }

  async updateSchedule(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    scheduleId: number,
    updateScheduleRequestDto: UpdateScheduleRequestDto,
  ): Promise<UpdateScheduleResponseDto> {
    const schedule = await transactionManager.findOne(ScheduleEntity, {
      where: { id: scheduleId, timetable: { userId: user.id } },
      relations: ['timetable'],
    });

    if (!schedule) {
      throwKukeyException('SCHEDULE_NOT_FOUND');
    }

    if (Number(schedule.timetableId) !== updateScheduleRequestDto.timetableId) {
      throwKukeyException('SCHEDULE_NOT_FOUND');
    }

    // 수정할 부분이 시간 or 요일일 때
    if (
      updateScheduleRequestDto.day &&
      updateScheduleRequestDto.startTime &&
      updateScheduleRequestDto.endTime
    ) {
      if (
        updateScheduleRequestDto.startTime >= updateScheduleRequestDto.endTime
      ) {
        throwKukeyException('INVALID_TIME_RANGE');
      }
      // 시간표에 존재하는 강의, 스케쥴과 수정하려는 스케쥴이 시간이 겹치는 지 확인
      const isConflict = await this.checkTimeConflict(
        updateScheduleRequestDto,
        scheduleId,
      );

      if (isConflict) {
        throwKukeyException('SCHEDULE_CONFLICT');
      }
    }

    await transactionManager.update(
      ScheduleEntity,
      { id: scheduleId },
      updateScheduleRequestDto,
    );
    // 수정된 스케줄 반환 (update는 return 값이 없어서 find로 찾고 반환)
    return await transactionManager.findOne(ScheduleEntity, {
      where: { id: scheduleId },
    });
  }

  async deleteSchedule(
    scheduleId: number,
    user: AuthorizedUserDto,
  ): Promise<DeleteScheduleResponseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, timetable: { userId: user.id } },
      relations: ['timetable'],
    });

    if (!schedule) {
      throwKukeyException('SCHEDULE_NOT_FOUND');
    }

    await this.scheduleRepository.softDelete(scheduleId);
    return new DeleteScheduleResponseDto(true);
  }

  async checkTimeConflict(
    schedule: CreateScheduleRequestDto,
    scheduleId?: number,
  ): Promise<boolean> {
    // 강의시간과 안 겹치는지 확인
    const existingCourseInfo = await this.getTimetableCourseInfo(
      schedule.timetableId,
    ); //요일, 시작시간, 끝나는 시간 받아옴

    for (const existingInfo of existingCourseInfo) {
      if (
        existingInfo.day === schedule.day &&
        isConflictingTime(
          existingInfo.startTime,
          existingInfo.endTime,
          schedule.startTime,
          schedule.endTime,
        )
      ) {
        return true; // 겹치는 시간 존재
      }
    }

    // 스케줄 시간과 겹치는지 안겹치는지 확인
    const existingScheduleInfo = await this.getTimetableScheduleInfo(
      schedule.timetableId,
    );

    for (const existingInfo of existingScheduleInfo) {
      // 예외 발생 케이스 처리
      if (scheduleId === Number(existingInfo.id)) continue;

      if (
        existingInfo.day === schedule.day &&
        isConflictingTime(
          existingInfo.startTime,
          existingInfo.endTime,
          schedule.startTime,
          schedule.endTime,
        )
      ) {
        return true; // 겹치는 시간 존재
      }
    }

    return false; // 겹치는 시간 없음
  }

  async getTimetableCourseInfo(
    timetableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const daysAndTimes =
      await this.timetableService.getDaysAndTime(timetableId);

    const result = daysAndTimes.map((obj) => ({
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
    }));

    return result;
  }

  async getTimetableScheduleInfo(
    timetableId: number,
  ): Promise<
    { id: number; day: string; startTime: string; endTime: string }[]
  > {
    const schedules = await this.scheduleRepository.find({
      where: { timetableId },
      select: ['id', 'day', 'startTime', 'endTime'],
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));
  }
}
