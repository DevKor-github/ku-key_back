import { Inject, Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { EntityManager, Like } from 'typeorm';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';
import { throwKukeyException } from 'src/utils/exception.util';
import { SearchCourseNewDto } from './dto/search-course-new.dto';
import { CourseSearchStrategy } from './strategy/course-search-strategy';

@Injectable()
export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private courseDetailRepository: CourseDetailRepository,
    @Inject('CourseSearchStrategy')
    private readonly strategies: CourseSearchStrategy[],
  ) {}

  async getCourseRepository(): Promise<CourseRepository> {
    return this.courseRepository;
  }

  async getCourse(courseId: number): Promise<CommonCourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseDetails'],
    });

    if (!course) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    return new CommonCourseResponseDto(course);
  }

  async getCourseWithCourseDetails(courseId: number): Promise<CourseEntity> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseDetails'],
    });
  }

  async getCourseDetails(courseId: number): Promise<CourseDetailEntity[]> {
    return await this.courseDetailRepository.find({
      where: { courseId: courseId },
    });
  }

  // 학수번호-교수님 성함으로 강의 존재 여부 확인
  async searchCourseCodeWithProfessorName(
    courseCode: string,
    professorName: string,
  ): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { courseCode: Like(`${courseCode}%`), professorName },
    });

    return course;
  }

  async searchCoursesByCourseCodeAndProfessorName(
    courseCode: string,
    professorName: string,
  ): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: {
        courseCode: Like(`${courseCode}%`),
        professorName,
      },
    });
  }

  async updateCourseTotalRate(
    courseIds: number[],
    totalRate: number,
    transactionManager: EntityManager,
  ): Promise<void> {
    for (const id of courseIds) {
      await transactionManager.update(CourseEntity, id, {
        totalRate: parseFloat(totalRate.toFixed(1)),
      });
    }
  }

  async mappingCourseDetailsToCourses(
    courses: CourseEntity[],
  ): Promise<PaginatedCoursesDto> {
    const courseInformations = courses.map(
      (course) => new CommonCourseResponseDto(course),
    );
    return new PaginatedCoursesDto(courseInformations);
  }

  async searchCourses(
    searchCourseNewDto: SearchCourseNewDto,
  ): Promise<PaginatedCoursesDto> {
    // 해당하는 검색 전략 찾아오기
    const searchStrategy = await this.findSearchStrategy(searchCourseNewDto);
    return await searchStrategy.search(searchCourseNewDto);
  }

  private async findSearchStrategy(
    searchCourseNewDto: SearchCourseNewDto,
  ): Promise<CourseSearchStrategy> {
    const { category } = searchCourseNewDto;
    const searchStrategy = this.strategies.find((strategy) =>
      strategy.supports(category),
    );

    if (!searchStrategy) {
      throwKukeyException('COURSE_SEARCH_STRATEGY_NOT_FOUND');
    }

    return searchStrategy;
  }
}
