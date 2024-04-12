import { Injectable } from "@nestjs/common";
import { TimeTableEntity } from "src/entities/timetable.entity";
import { DataSource, Repository } from "typeorm";
import { CreateTimeTableDto } from "./dto/create-timetable.dto";

@Injectable()
export class TimeTableRepository extends Repository<TimeTableEntity> {
    constructor(dataSource: DataSource){
        super(TimeTableEntity, dataSource.createEntityManager());
    }

    async createTimeTable(createTimeTableDto: CreateTimeTableDto): Promise<TimeTableEntity> {
        const timetable = this.create(createTimeTableDto);
        return await this.save(timetable);
    }
}