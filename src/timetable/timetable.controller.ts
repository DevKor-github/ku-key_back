import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimeTableService } from './timetable.service';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';

@Controller('timetable')
export class TimeTableController {
  constructor(private readonly timeTableService: TimeTableService) {}

  // timetable 에 course 추가 (존재하는 강의가 있을 때 추가하지 못하도록)
  @Post('course')
  async createTimeTableCourse(
    @Query('timeTableId') timeTableId: number,
    @Query('courseId') courseId: number,
  ): Promise<TimeTableCourseEntity> {
    return await this.timeTableService.createTimeTableCourse(
      timeTableId,
      courseId,
    );
  }

  @Post()
  async createTimeTable(
    @Body() createTimeTableDto: CreateTimeTableDto,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.createTimeTable(createTimeTableDto);
  }

  // 특정 시간표 가져오기
  @Get('/:timeTableId')
  async getTimeTable(
    @Param('timeTableId') timeTableId: number,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.getTimeTable(timeTableId);
  }

  @Delete('/:timeTableId')
  async deleteTimeTable(
    @Param('timeTableId') timeTableId: number,
  ): Promise<void> {
    return await this.timeTableService.deleteTimeTable(timeTableId);
  }
}
