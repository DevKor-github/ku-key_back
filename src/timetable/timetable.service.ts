import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';
import { timeTableCourseRepository } from './timetable-course.repository';

@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(TimeTableRepository)
        private timeTableRepository: TimeTableRepository,
        
        @InjectRepository(timeTableCourseRepository)
        private timeTableCourseRepository: timeTableCourseRepository,
    ) {}

    async createTimeTable(createTimeTableDto: CreateTimeTableDto): Promise<TimeTableEntity> {
        return await this.timeTableRepository.createTimeTable(createTimeTableDto);
    }

    async createTimeTableCourse(timeTableId: number, courseId: number): Promise<TimeTableCourseEntity> {
        return await this.timeTableCourseRepository.createTimeTableCourse(timeTableId, courseId);
    }

    async getTimeTable(timeTableId: number): Promise<TimeTableEntity> {
        return await this.timeTableRepository.findOne({
            where : { id : timeTableId },
        });
    }
}
