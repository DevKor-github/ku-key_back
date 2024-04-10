import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { CreateCourseDetailDto } from './dto/create-course-detail.dto';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseRepository)
    private courseRepository: CourseRepository,

    @InjectRepository(CourseDetailRepository)
    private courseDetailRepository: CourseDetailRepository,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
    return await this.courseRepository.createCourse(createCourseDto);
  }

  async createCourseDetail(
    createCourseDetailDto: CreateCourseDetailDto,
  ): Promise<CourseDetailEntity> {
    try {
      // Check if course exists
      await this.courseRepository.findOne({
        where: { id: createCourseDetailDto.courseId },
      });
      return await this.courseDetailRepository.createCourseDetail(
        createCourseDetailDto,
      );
    } catch (error) {
      throw new NotFoundException(
        `Course with id ${createCourseDetailDto.courseId} not found`,
      );
    }
  }

  async getAllCourses(): Promise<CourseEntity[]> {
    return await this.courseRepository.find();
  }

  async getCourse(courseId: number): Promise<CourseEntity> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
    });
  }

  async getCourseSearch(search: string): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: {
        major: search,
      },
    });
  }
}
