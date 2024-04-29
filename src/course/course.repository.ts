import { Injectable } from '@nestjs/common';
import { CourseEntity } from 'src/entities/course.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseRepository extends Repository<CourseEntity> {
  constructor(dataSource: DataSource) {
    super(CourseEntity, dataSource.createEntityManager());
  }

  async createCourse(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
    const course = this.create(createCourseDto);
    return await this.save(course);
  }

  async updateCourse(updateCourseDto : UpdateCourseDto, courseId: number): Promise<CourseEntity> {
    const course = await this.findOne({
      where: { id: courseId },
    });
    const updatedCourse = Object.assign(course, updateCourseDto);
    return await this.save(updatedCourse);
  }
}
