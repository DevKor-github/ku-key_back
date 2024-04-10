import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(CourseRepository)
        private courseRepository: CourseRepository,
    ){}

    async createCourse(createCourseDto: CreateCourseDto): Promise<CourseEntity>{
        return await this.courseRepository.createCourse(createCourseDto);
    }
}
