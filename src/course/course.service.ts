import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { CreateCourseDetailDto } from './dto/create-course-detail.dto';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseDetailDto } from './dto/update-course-detail.dto';
import { Like } from 'typeorm';
import { SearchCourseDto } from './dto/search-course.dto';

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

  // 학수번호 검색
  async getCourseSearch(
    searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: { courseCode : searchCourseDto.courseCode }
    });
  }

  // 교양 리스트 반환
  async getGeneralCourses(): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: { category: '교양' },
    });
  }

  // 전공 리스트 반환
  async getMajorCourses(major: string): Promise<CourseEntity[]> {
    if (!major) throw new BadRequestException('Major is required!');
    return await this.courseRepository.find({
      where: { category: '전공', major: major },
    });
  }

  // 학문의 기초 리스트 반환
  async getBasicsOfAcademicsCourses(): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: { category: '학문의 기초' },
    });
  }

  async updateCourseDetail(
    updateCourseDetailDto: UpdateCourseDetailDto,
    courseDetailId: number,
  ): Promise<CourseDetailEntity> {
    return await this.courseDetailRepository.updateCourseDetail(
      updateCourseDetailDto,
      courseDetailId,
    );
  }

  async updateCourse(
    updateCourseDto: UpdateCourseDto,
    courseId: number,
  ): Promise<CourseEntity> {
    return await this.courseRepository.updateCourse(updateCourseDto, courseId);
  }
}
