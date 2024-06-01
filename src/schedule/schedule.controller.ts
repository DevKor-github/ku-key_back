import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ScheduleEntity } from 'src/entities/schedule.entity';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';

@Controller('schedule')
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // 스케쥴 추가
  @Post()
  async createSchedule(
    @User() user: AuthorizedUserDto,
    @Body() createScheduleRequestDto: CreateScheduleRequestDto,
  ): Promise<ScheduleEntity> {
    return await this.scheduleService.createSchedule(
      createScheduleRequestDto,
      user,
    );
  }

  // 시간표에 등록된 스케쥴 삭제
  @Delete('/:scheduleId')
  async deleteSchedule(
    @User() user: AuthorizedUserDto,
    @Param('scheduleId') scheduleId: number,
  ): Promise<void> {
    return await this.scheduleService.deleteSchedule(scheduleId, user);
  }
}
