import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CourseDetailEntity } from "src/entities/course-detail.entity";
import { CreateCourseDetailDto } from "./dto/create-course-detail.dto";
import { UpdateCourseDetailDto } from "./dto/update-course-detail.dto";

@Injectable()
export class CourseDetailRepository extends Repository<CourseDetailEntity>{
    constructor(dataSource : DataSource){
        super(CourseDetailEntity, dataSource.createEntityManager());
    }

    async createCourseDetail(createCourseDetailDto: CreateCourseDetailDto) : Promise<CourseDetailEntity>{
        const courseDetail = this.create(createCourseDetailDto);
        return await this.save(courseDetail);
    }

    async updateCourseDetail(updateCourseDetailDto: UpdateCourseDetailDto, courseDetailId: number) : Promise<CourseDetailEntity>{
        const courseDetail = await this.findOne({
            where: {id : courseDetailId}
        });
        const updatedCourseDetail = Object.assign(courseDetail, updateCourseDetailDto);
        return await this.save(updatedCourseDetail);
    }

}