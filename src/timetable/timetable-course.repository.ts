import { Injectable } from "@nestjs/common";
import { TimeTableCourseEntity } from "src/entities/timetable-course.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class timeTableCourseRepository extends Repository<TimeTableCourseEntity> {
    constructor(dataSource : DataSource){
        super(TimeTableCourseEntity, dataSource.createEntityManager());
    }

    async createTimeTableCourse(timeTableId: number, courseId: number): Promise<TimeTableCourseEntity>{
        const timetableCourse = this.create({timeTableId, courseId});
        return await this.save(timetableCourse);
    }
}