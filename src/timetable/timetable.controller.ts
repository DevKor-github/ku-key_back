import { Body, Controller, Param, Post, Query } from '@nestjs/common';
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

}
