import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateScheduleResponseDto } from './dto/create-schedule-response.dto';
import { DeleteScheduleResponseDto } from './dto/delete-schedule-response.dto';
import { UpdateScheduleRequestDto } from './dto/update-schedule-request.dto';
import { UpdateScheduleResponseDto } from './dto/update-schedule-response.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { ScheduleDocs } from 'src/decorators/docs/schedule.decorator';

@Controller('schedule')
@ApiTags('schedule')
@ApiBearerAuth('accessToken')
@ScheduleDocs
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // 스케쥴 추가
  @Post()
  async createSchedule(
    @User() user: AuthorizedUserDto,
    @Body() createScheduleRequestDto: CreateScheduleRequestDto,
  ): Promise<CreateScheduleResponseDto> {
    return await this.scheduleService.createSchedule(
      createScheduleRequestDto,
      user,
    );
  }

  @Patch('/:scheduleId')
  @UseInterceptors(TransactionInterceptor)
  async updateSchedule(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('scheduleId') scheduleId: number,
    @Body() updateScheduleRequestDto: UpdateScheduleRequestDto,
  ): Promise<UpdateScheduleResponseDto> {
    return await this.scheduleService.updateSchedule(
      transactionManager,
      user,
      scheduleId,
      updateScheduleRequestDto,
    );
  }

  // 시간표에 등록된 스케쥴 삭제
  @Delete('/:scheduleId')
  async deleteSchedule(
    @User() user: AuthorizedUserDto,
    @Param('scheduleId') scheduleId: number,
  ): Promise<DeleteScheduleResponseDto> {
    return await this.scheduleService.deleteSchedule(scheduleId, user);
  }
}
