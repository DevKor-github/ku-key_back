import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableRepository } from './timetable.repository';

@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(TimeTableRepository)
        private timeTableRepository: TimeTableRepository,
    ) {}

    async createTimeTable(createTimeTableDto: CreateTimeTableDto): Promise<TimeTableEntity> {
        return await this.timeTableRepository.createTimeTable(createTimeTableDto);
    }
}
