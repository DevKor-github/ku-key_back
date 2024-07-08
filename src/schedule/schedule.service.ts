import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { ScheduleRepository } from './schedule.repository';
import { TimetableService } from 'src/timetable/timetable.service';
import { DeleteScheduleResponseDto } from './dto/delete-schedule-response.dto';
import { UpdateScheduleRequestDto } from './dto/update-schedule-request.dto';
import { UpdateScheduleResponseDto } from './dto/update-schedule-response.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    @Inject(forwardRef(() => TimetableService))
    private readonly timetableService: TimetableService,
    private readonly dataSource: DataSource,
  ) {}

  async getScheduleByTimetableId(
    timetableId: number,
  ): Promise<ScheduleEntity[]> {
    try {
      return await this.scheduleRepository.find({ where: { timetableId } });
    } catch (error) {
      console.error('Fail to get schedule by timetable id', error);
      throw error;
    }
  }

  async createSchedule(
    createScheduleRequestDto: CreateScheduleRequestDto,
    user: AuthorizedUserDto,
  ): Promise<ScheduleEntity> {
    try {
      const timetable =
        await this.timetableService.getSimpleTimetableByTimetableId(
          createScheduleRequestDto.timetableId,
          user.id,
        );
      if (!timetable) {
        throw new NotFoundException('Timetable not found');
      }

      // 시간표에 존재하는 강의, 스케쥴과 추가하려는 스케쥴이 시간이 겹치는 지 확인
      const isConflict = await this.checkTimeConflict(createScheduleRequestDto);

      if (isConflict) {
        throw new ConflictException(
          'Schedule conflicts with existing courses and schedules',
        );
      }

      const newSchedule = this.scheduleRepository.create({
        ...createScheduleRequestDto,
      });

      return await this.scheduleRepository.save(newSchedule);
    } catch (error) {
      console.error('Fail to create schedule to timetable', error);
      throw error;
    }
  }

  async updateSchedule(
    user: AuthorizedUserDto,
    scheduleId: number,
    updateScheduleRequestDto: UpdateScheduleRequestDto,
  ): Promise<UpdateScheduleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const schedule = await queryRunner.manager.findOne(ScheduleEntity, {
        where: { id: scheduleId, timetable: { userId: user.id } },
        relations: ['timetable'],
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      if (
        Number(schedule.timetableId) !== updateScheduleRequestDto.timetableId
      ) {
        throw new NotFoundException(
          '변경하고자 하는 일정이 해당 시간표에 존재하지 않습니다!',
        );
      }

      // 수정할 부분이 시간 or 요일일 때
      if (
        updateScheduleRequestDto.day &&
        updateScheduleRequestDto.startTime &&
        updateScheduleRequestDto.endTime
      ) {
        // 시간표에 존재하는 강의, 스케쥴과 수정하려는 스케쥴이 시간이 겹치는 지 확인
        const isConflict = await this.checkTimeConflict(
          updateScheduleRequestDto,
          scheduleId,
        );

        if (isConflict) {
          throw new ConflictException(
            'Schedule conflicts with existing courses and schedules',
          );
        }
      }

      await queryRunner.manager.update(
        ScheduleEntity,
        { id: scheduleId },
        updateScheduleRequestDto,
      );
      await queryRunner.commitTransaction();
      // 수정된 스케줄 반환 (update는 return 값이 없어서 find로 찾고 반환)
      return await queryRunner.manager.findOne(ScheduleEntity, {
        where: { id: scheduleId },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Fail to update schedule', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteSchedule(
    scheduleId: number,
    user: AuthorizedUserDto,
  ): Promise<DeleteScheduleResponseDto> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId, timetable: { userId: user.id } },
        relations: ['timetable'],
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      await this.scheduleRepository.softDelete(scheduleId);
      return { deleted: true };
    } catch (error) {
      console.error('Fail to delete schedule', error);
      throw error;
    }
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
        this.isConflictingTime(
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
      // 변경하고자 하는 일정이 기존의 일정 시간대 내에서 변경하는 경우 (ex : 토요일 10:30~12:00 -> 토요일 11:00 ~ 12:00)
      if (
        scheduleId === Number(existingInfo.id) &&
        String(schedule.day) === existingInfo.day &&
        this.timeToNumber(schedule.startTime) >=
          this.timeToNumber(existingInfo.startTime) &&
        this.timeToNumber(schedule.endTime) <=
          this.timeToNumber(existingInfo.endTime)
      ) {
        return false;
      }
      if (
        existingInfo.day === schedule.day &&
        this.isConflictingTime(
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
  // 문자열 시간을 숫자로 변환 (HH:MM:SS -> seconds)
  private timeToNumber = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  private isConflictingTime(
    existingStartTime: string,
    existingEndTime: string,
    newStartTime: string,
    newEndTime: string,
  ): boolean {
    const existingStart = this.timeToNumber(existingStartTime);
    const existingEnd = this.timeToNumber(existingEndTime);
    const newStart = this.timeToNumber(newStartTime);
    const newEnd = this.timeToNumber(newEndTime);

    // 시간이 겹치는지 확인
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  }
}
