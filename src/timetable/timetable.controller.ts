import { Body, Controller, Post } from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
    constructor(private timeTableService:TimetableService) {}

    @Post()
    async createTimeTable(
        @Body() createTimeTableDto : CreateTimeTableDto,
    ) : Promise<TimeTableEntity>{
        return await this.timeTableService.createTimeTable(createTimeTableDto);
    }
}
