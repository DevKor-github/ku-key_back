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
import { ApiTags } from '@nestjs/swagger';
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
import { CalendarDocs } from 'src/decorators/docs/calendar.decorator';

@Controller('calendar')
@ApiTags('calendar')
@CalendarDocs
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getMonthlyCalendarData(
    @Query() queryDto: GetMonthlyCalendarDataRequestDto,
  ): Promise<GetDailyCalendarDataResponseDto[]> {
    return await this.calendarService.getMonthlyCalendarData(
      queryDto.year,
      queryDto.month,
    );
  }

  @Get('academic')
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
  async createCalendarData(
    @Body() body: CreateCalendarDataRequestDto,
  ): Promise<CreateCalendarDataResponseDto> {
    return await this.calendarService.createCalendarData(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('/:calendarId')
  async updateCalendarData(
    @Param('calendarId') calendarId: number,
    @Body() body: UpdateCalendarDataRequestDto,
  ): Promise<UpdateCalendarDataResponseDto> {
    return await this.calendarService.updateCalendarData(calendarId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('/:calendarId')
  async deleteCalendarData(
    @Param('calendarId') calendarId: number,
  ): Promise<DeleteCalendarDataResponseDto> {
    return await this.calendarService.deleteCalendarData(calendarId);
  }

  @Get('banner-image-urls')
  async getBannerImageUrls(): Promise<GetBannerImageUrlResponseDto[]> {
    return await this.calendarService.getBannerImageUrls();
  }
}
