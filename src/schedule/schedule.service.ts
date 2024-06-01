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
import { TimeTableService } from 'src/timetable/timetable.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    @Inject(forwardRef(() => TimeTableService))
    private readonly timeTableService: TimeTableService,
  ) {}

  async createSchedule(
    createScheduleRequestDto: CreateScheduleRequestDto,
    user: AuthorizedUserDto,
  ): Promise<ScheduleEntity> {
    try {
      const timeTable =
        await this.timeTableService.getSimpleTimeTableByTimeTableId(
          createScheduleRequestDto.timeTableId,
          user.id,
        );
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
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

  async deleteSchedule(
    scheduleId: number,
    user: AuthorizedUserDto,
  ): Promise<void> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId, timeTable: { userId: user.id } },
        relations: ['timeTable'],
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      await this.scheduleRepository.softDelete(scheduleId);
    } catch (error) {
      console.error('Fail to delete schedule', error);
      throw error;
    }
  }

  async checkTimeConflict(
    schedule: CreateScheduleRequestDto,
  ): Promise<boolean> {
    // 강의시간과 안 겹치는지 확인
    const existingCourseInfo = await this.getTableCourseInfo(
      schedule.timeTableId,
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
    const existingScheduleInfo = await this.getTableScheduleInfo(
      schedule.timeTableId,
    );
    console.log(existingScheduleInfo);
    for (const existingInfo of existingScheduleInfo) {
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

  async getTableCourseInfo(
    timeTableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const daysAndTimes =
      await this.timeTableService.getDaysAndTime(timeTableId);

    const result = daysAndTimes.map((obj) => ({
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
    }));

    return result;
  }

  async getTableScheduleInfo(
    timeTableId: number,
  ): Promise<{ day: string; startTime: string; endTime: string }[]> {
    const schedules = await this.scheduleRepository.find({
      where: { timeTableId },
      select: ['day', 'startTime', 'endTime'],
    });

    return schedules.map((schedule) => ({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));
  }

  private isConflictingTime(
    existingStartTime: string,
    existingEndTime: string,
    newStartTime: string,
    newEndTime: string,
  ): boolean {
    // 문자열 시간을 숫자로 변환 (HH:MM:SS -> seconds)
    const timeToNumber = (time: string): number => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const existingStart = timeToNumber(existingStartTime);
    const existingEnd = timeToNumber(existingEndTime);
    const newStart = timeToNumber(newStartTime);
    const newEnd = timeToNumber(newEndTime);

    // 시간이 겹치는지 확인
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  }
}
