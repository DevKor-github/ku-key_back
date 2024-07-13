import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetCalendarDataResponseDto } from './dto/get-calendar-data-response-dto';
import { GetCalendarDataQueryDto } from './dto/get-calendar-data-query-dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-response.dto';

@Controller('calendar')
@ApiTags('calendar')
@ApiBearerAuth('accessToken')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: '연도, 월별 행사/일정 조회',
    description: '연도, 월 정보를 받아 그 날짜의 행사/일정을 조회합니다.',
  })
  @ApiQuery({ name: 'year', required: true, description: '연도' })
  @ApiQuery({ name: 'month', required: true, description: '월' })
  @ApiOkResponse({
    description: '특정 연도, 월별 행사/일정 데이터 반환',
    type: GetCalendarDataResponseDto,
  })
  async getCalendarData(
    @Query() queryDto: GetCalendarDataQueryDto,
  ): Promise<GetCalendarDataResponseDto[]> {
    return await this.calendarService.getCalendarData(
      queryDto.year,
      queryDto.month,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  @ApiOperation({
    summary: '특정 날짜 행사/일정 생성',
    description: '특정 날짜의 행사/일정을 생성합니다.',
  })
  @ApiBody({ type: CreateCalendarDataRequestDto })
  @ApiCreatedResponse({
    description: '행사/일정 생성 성공',
    type: CreateCalendarDataResponseDto,
  })
  async createCalendarData(
    @Body() body: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    return await this.calendarService.createcalendarData(body);
  }
}
