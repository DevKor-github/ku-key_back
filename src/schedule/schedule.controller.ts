import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateScheduleRequestDto } from './dto/create-schedule-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateScheduleResponseDto } from './dto/create-schedule-response.dto';
import { DeleteScheduleResponseDto } from './dto/delete-schedule-response.dto';
import { UpdateScheduleRequestDto } from './dto/update-schedule-request.dto';
import { UpdateScheduleResponseDto } from './dto/update-schedule-response.dto';

@Controller('schedule')
@ApiTags('schedule')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // 스케쥴 추가
  @Post()
  @ApiOperation({
    summary: '시간표에 개인 스케쥴 추가',
    description:
      '시간표에 개인 스케쥴을 추가합니다. 해당 시간에 이미 등록된 개인 스케쥴이나 강의가 있을 경우 추가되지 않습니다.',
  })
  @ApiBody({
    type: CreateScheduleRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '스케쥴 추가 성공',
    type: CreateScheduleResponseDto,
  })
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
  @ApiOperation({
    summary: '시간표에 개인 스케쥴 수정',
    description: '시간표에 등록된 개인 스케쥴을 수정합니다.',
  })
  @ApiParam({
    name: 'scheduleId',
    type: 'number',
    required: true,
    description: '수정할 스케쥴 ID',
  })
  @ApiBody({
    type: UpdateScheduleRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '스케쥴 수정 성공 시',
    type: UpdateScheduleResponseDto,
  })
  async updateSchedule(
    @User() user: AuthorizedUserDto,
    @Param('scheduleId') scheduleId: number,
    @Body() updateScheduleRequestDto: UpdateScheduleRequestDto,
  ): Promise<UpdateScheduleResponseDto> {
    return await this.scheduleService.updateSchedule(
      user,
      scheduleId,
      updateScheduleRequestDto,
    );
  }

  // 시간표에 등록된 스케쥴 삭제
  @Delete('/:scheduleId')
  @ApiOperation({
    summary: '시간표에 개인 스케쥴 삭제',
    description: '시간표에 등록된 개인 스케쥴을 삭제합니다.',
  })
  @ApiParam({
    name: 'scheduleId',
    type: 'number',
    required: true,
    description: '삭제할 스케쥴 ID',
  })
  @ApiResponse({
    status: 200,
    description: '스케쥴 삭제 성공 시',
    type: DeleteScheduleResponseDto,
  })
  async deleteSchedule(
    @User() user: AuthorizedUserDto,
    @Param('scheduleId') scheduleId: number,
  ): Promise<DeleteScheduleResponseDto> {
    return await this.scheduleService.deleteSchedule(scheduleId, user);
  }
}
