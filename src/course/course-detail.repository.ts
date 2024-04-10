import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CourseDetailEntity } from "src/entities/course-detail.entity";
import { CreateCourseDetailDto } from "./dto/create-course-detail.dto";

@Injectable()
export class CourseDetailRepository extends Repository<CourseDetailEntity>{
    constructor(dataSource : DataSource){
        super(CourseDetailEntity, dataSource.createEntityManager());
    }

    async createCourseDetail(createCourseDetailDto: CreateCourseDetailDto) : Promise<CourseDetailEntity>{
        const courseDetail = this.create(createCourseDetailDto);
        return await this.save(courseDetail);
    }

}