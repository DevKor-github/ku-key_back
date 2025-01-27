import { CourseCategory } from 'src/enums/course-category.enum';
import { Injectable } from '@nestjs/common';
import { CourseSearchStrategy } from './course-search-strategy';
import { PaginatedCoursesDto } from '../dto/paginated-courses.dto';
import { SearchCourseNewDto } from '../dto/search-course-new.dto';
import { CourseService } from '../course.service';
import { Brackets } from 'typeorm';

@Injectable()
export class AllCoursesSearchStrategy implements CourseSearchStrategy {
  constructor(private readonly courseService: CourseService) {}

  supports(category: CourseCategory): boolean {
    return category === CourseCategory.ALL_CLASS;
  }

  async search(
    searchCourseNewDto: SearchCourseNewDto,
  ): Promise<PaginatedCoursesDto> {
    const courseRepository = await this.courseService.getCourseRepository();
    const { keyword, cursorId, year, semester } = searchCourseNewDto;

    const LIMIT = PaginatedCoursesDto.LIMIT;

    let queryBuilder = courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.courseDetails', 'courseDetails')
      .where('course.year = :year', { year })
      .andWhere('course.semester = :semester', { semester });

    queryBuilder = queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where('course.courseName LIKE :keyword', { keyword: `%${keyword}%` })
          .orWhere('course.professorName LIKE :keyword', {
            keyword: `%${keyword}%`,
          })
          .orWhere('course.courseCode LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
      }),
    );

    if (cursorId) {
      queryBuilder = queryBuilder.andWhere('course.id > :cursorId', {
        cursorId,
      });
    }

    queryBuilder = queryBuilder.orderBy('course.id', 'ASC').take(LIMIT);

    const courses = await queryBuilder.getMany();
    return await this.courseService.mappingCourseDetailsToCourses(courses);
  }
}
