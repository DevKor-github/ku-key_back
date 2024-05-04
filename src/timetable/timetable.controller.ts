import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimetableService } from './timetable.service';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';

@Controller('timetable')
export class TimetableController {
    constructor(private timeTableService:TimetableService) {}

    // timetable 에 course 추가
    @Post('course')
    async createTimeTableCourse(
        @Query('timeTableId') timeTableId : number,
        @Query('courseId') courseId : number,
    ) : Promise<TimeTableCourseEntity> {
        return await this.timeTableService.createTimeTableCourse(timeTableId, courseId);
    
    }

    @Post()
    async createTimeTable(
        @Body() createTimeTableDto : CreateTimeTableDto,
    ) : Promise<TimeTableEntity>{
        return await this.timeTableService.createTimeTable(createTimeTableDto);
    }

    // 특정 시간표 가져오기 (시간표 틀만, 시간표에 등록된 강의 조회 아님)
    @Get('/:timeTableId')
    async getTimeTable(@Param('timeTableId') timeTableId : number) : Promise<TimeTableEntity> {
        return await this.timeTableService.getTimeTable(timeTableId);
    }

    @Delete('/:timeTableId')
    async deleteTimeTable(@Param('timeTableId') timeTableId : number) : Promise<void> {
        return await this.timeTableService.deleteTimeTable(timeTableId);
    }
}
