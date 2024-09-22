import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetDailyCalendarDataResponseDto } from './dto/get-calendar-data-response-dto';
import { GetMonthlyCalendarDataRequestDto } from './dto/get-calendar-data-request-dto';
import { CreateCalendarDataRequestDto } from './dto/create-calendar-data-request.dto';
import { CreateCalendarDataResponseDto } from './dto/create-calendar-data-response.dto';
import { UpdateCalendarDataRequestDto } from './dto/update-calendar-data-request.dto';
import { UpdateCalendarDataResponseDto } from './dto/update-calendar-data-response.dto';
import { DeleteCalendarDataResponseDto } from './dto/delete-calendar-data-response-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { GetAcademicScheduleDataRequestDto } from './dto/get-academic-schedule-request.dto';
import { GetAcademicScheduleDataResponseDto } from './dto/get-academic-schedule-response.dto';
import { GetBannerImageUrlResponseDto } from './dto/get-banner-images-response.dto';
import { UnhandledExceptionFilter } from 'src/common/filter/unhandled-exception.filter';
import { KukeyExceptionFilter } from 'src/common/filter/kukey-exception.filter';

@Controller('calendar')
@ApiTags('calendar')
@UseFilters(UnhandledExceptionFilter, KukeyExceptionFilter)
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
    @Query() queryDto: GetMonthlyCalendarDataRequestDto,
  ): Promise<GetDailyCalendarDataResponseDto[]> {
    return await this.calendarService.getMonthlyCalendarData(
      queryDto.year,
      queryDto.month,
    );
  }

  @Get('academic')
  @ApiOperation({
    summary: 'Academic Schedule 행사/일정 조회',
    description:
      '연도, 학기 정보를 받아 Academic Schedule에 해당하는 행사/일정을 조회합니다. 행사/일정이 존재하는 날짜의 경우에만 가져옵니다.',
  })
  @ApiQuery({ name: 'year', required: true, description: '연도' })
  @ApiQuery({ name: 'semester', required: true, description: '학기' })
  @ApiOkResponse({
    description: '특정 연도, 학기별 Academic Schedule 행사/일정 데이터 반환',
    isArray: true,
    type: GetAcademicScheduleDataResponseDto,
  })
  async getAcademicScheduleData(
    @Query() queryDto: GetAcademicScheduleDataRequestDto,
  ): Promise<GetAcademicScheduleDataResponseDto[]> {
    return await this.calendarService.getAcademicScheduleData(
      queryDto.year,
      queryDto.semester,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  @ApiBearerAuth('accessToken')
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
  @ApiBearerAuth('accessToken')
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
  @ApiBearerAuth('accessToken')
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

  @Get('banner-image-urls')
  @ApiOperation({
    summary: '메인 홈 배너 이미지 URL 목록 조회',
    description: 'S3에 저장된 메인 홈 배너 이미지 URL 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: 'URL 목록 반환',
    type: [GetBannerImageUrlResponseDto],
  })
  async getBannerImageUrls(): Promise<GetBannerImageUrlResponseDto[]> {
    return await this.calendarService.getBannerImageUrls();
  }
}
