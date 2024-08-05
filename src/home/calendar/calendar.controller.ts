import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetDailyCalendarDataResponseDto,
  GetMonthlyCalendarDataResponseDto,
} from './dto/get-calendar-data-response-dto';
import {
  GetMonthlyCalendarDataQueryDto,
  GetYearlyCalendarDataQueryDto,
} from './dto/get-calendar-data-query-dto';
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-data-response.dto';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';
import { UpdateCalendarDataResponseDto } from './dto/update-calendar-data-response.dto';
import { DeleteCalendarDataResponseDto } from './dto/delete-calendar-data-response-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('calendar')
@ApiTags('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({
    summary: '연도, 월별 행사/일정 조회',
    description:
      '연도, 월 정보를 받아 그 달의 행사/일정을 조회합니다. 행사/일정 존재여부에 상관없이 그 달의 모든 날짜를 반환합니다.',
  })
  @ApiQuery({ name: 'year', required: true, description: '연도' })
  @ApiQuery({ name: 'month', required: true, description: '월' })
  @ApiOkResponse({
    description: '특정 연도, 월별 행사/일정 데이터 반환',
    isArray: true,
    type: GetDailyCalendarDataResponseDto,
  })
  async getMonthlyCalendarData(
    @Query() queryDto: GetMonthlyCalendarDataQueryDto,
  ): Promise<GetDailyCalendarDataResponseDto[]> {
    return await this.calendarService.getMonthlyCalendarData(
      queryDto.year,
      queryDto.month,
    );
  }

  @Get('yearly')
  @ApiOperation({
    summary: '연도별 행사/일정 전체 조회',
    description:
      '연도별 행사/일정 전체를 조회합니다. 행사/일정이 존재하는 날짜의 경우에만 가져옵니다.',
  })
  @ApiQuery({ name: 'year', required: true, description: '연도' })
  @ApiOkResponse({
    description: '특정 연도별 행사/일정 데이터 반환',
    isArray: true,
    type: GetMonthlyCalendarDataResponseDto,
  })
  async getYearlyCalendarData(
    @Query() queryDto: GetYearlyCalendarDataQueryDto,
  ): Promise<GetMonthlyCalendarDataResponseDto[]> {
    return await this.calendarService.getYearlyCalendarData(queryDto.year);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  @ApiOperation({
    summary: '특정 날짜 행사/일정 생성',
    description: 'admin page에서 특정 날짜의 행사/일정을 생성합니다.',
  })
  @ApiBody({ type: CreateCalendarDataRequestDto })
  @ApiCreatedResponse({
    description: '행사/일정 생성 성공',
    type: CreateCalendarDataResponseDto,
  })
  async createCalendarData(
    @Body() body: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    return await this.calendarService.createCalendarData(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('/:calendarId')
  @ApiOperation({
    summary: '특정 행사/일정 수정',
    description:
      '행사/일정 id를 받아 admin page에서 해당하는 행사/일정을 수정합니다.',
  })
  @ApiParam({ name: 'calendarId', description: '행사/일정 id' })
  @ApiBody({ type: UpdateCalendarDataRequestDto })
  @ApiOkResponse({
    description: '행사/일정 수정 성공',
    type: UpdateCalendarDataResponseDto,
  })
  async updateCalendarData(
    @Param('calendarId') calendarId: number,
    @Body() body: UpdateCalendarDataRequestDto,
  ): Promise<UpdateCalendarDataResponseDto> {
    return await this.calendarService.updateCalendarData(calendarId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('/:calendarId')
  @ApiOperation({
    summary: '특정 행사/일정 삭제',
    description:
      '행사/일정 id를 받아 admin page에서 해당하는 행사/일정을 삭제합니다.',
  })
  @ApiParam({ name: 'calendarId', description: '행사/일정 id' })
  @ApiOkResponse({
    description: '행사/일정 삭제 성공',
    type: DeleteCalendarDataResponseDto,
  })
  async deleteCalendarData(
    @Param('calendarId') calendarId: number,
  ): Promise<DeleteCalendarDataResponseDto> {
    return await this.calendarService.deleteCalendarData(calendarId);
  }
}
