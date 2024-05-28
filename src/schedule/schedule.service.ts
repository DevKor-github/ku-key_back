import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { Repository } from 'typeorm';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { TimeTableRepository } from 'src/timetable/timetable.repository';
import { ScheduleRepository } from './schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    @Inject(forwardRef(() => TimeTableRepository))
    private readonly timeTableRepository: TimeTableRepository,
  ) {}

  async createSchedule(
    timeTableId: number,
    createScheduleRequestDto: CreateScheduleRequestDto,
    user: AuthorizedUserDto,
  ): Promise<ScheduleEntity> {
    try {
      const timeTable = await this.timeTableRepository.findOne({
        where: { id: timeTableId, userId: user.id },
      });
      if (!timeTable) {
        throw new NotFoundException('TimeTable not found');
      }

      const schedule = this.scheduleRepository.create({
        ...createScheduleRequestDto,
        timeTableId,
      });

      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      console.error('Fail to create schedule', error);
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
}
