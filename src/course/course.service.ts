import { Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { Brackets, EntityManager, Like, MoreThan } from 'typeorm';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { SearchCourseCodeDto } from './dto/search-course-code.dto';
import { SearchCourseNameDto } from './dto/search-course-name.dto';
import { SearchProfessorNameDto } from './dto/search-professor-name.dto';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';
import { throwKukeyException } from 'src/utils/exception.util';
import { GetGeneralCourseDto } from './dto/get-general-course.dto';
import { GetMajorCourseDto } from './dto/get-major-course.dto';
import { GetAcademicFoundationCourseDto } from './dto/get-academic-foundation-course.dto';
import { SearchCoursesWithKeywordDto } from './dto/search-courses-with-keyword.dto';

@Injectable()
export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private courseDetailRepository: CourseDetailRepository,
  ) {}

  async searchAllCourses(
    searchCoursesWithKeywordDto: SearchCoursesWithKeywordDto,
  ): Promise<PaginatedCoursesDto> {
    const courses = await this.runSearchCoursesQuery(
      searchCoursesWithKeywordDto,
    );
    return await this.mappingCourseDetailsToCourses(courses);
  }

  async searchMajorCourses(
    major: string,
    searchCoursesWithKeywordDto: SearchCoursesWithKeywordDto,
  ): Promise<PaginatedCoursesDto> {
    if (!major) throwKukeyException('MAJOR_REQUIRED');

    const courses = await this.runSearchCoursesQuery(
      searchCoursesWithKeywordDto,
      {
        major,
        category: 'Major',
      },
    );
    return await this.mappingCourseDetailsToCourses(courses);
  }

  async searchGeneralCourses(
    searchCoursesWithKeywordDto: SearchCoursesWithKeywordDto,
  ): Promise<PaginatedCoursesDto> {
    const courses = await this.runSearchCoursesQuery(
      searchCoursesWithKeywordDto,
      {
        category: 'General Studies',
      },
    );
    return await this.mappingCourseDetailsToCourses(courses);
  }

  async searchAcademicFoundationCourses(
    college: string,
    searchCoursesWithKeywordDto: SearchCoursesWithKeywordDto,
  ): Promise<PaginatedCoursesDto> {
    if (!college) throwKukeyException('COLLEGE_REQUIRED');
    const courses = await this.runSearchCoursesQuery(
      searchCoursesWithKeywordDto,
      {
        college,
        category: 'Academic Foundations',
      },
    );
    return await this.mappingCourseDetailsToCourses(courses);
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

  // 학수번호 검색
  async searchCourseCode(
    searchCourseCodeDto: SearchCourseCodeDto,
  ): Promise<PaginatedCoursesDto> {
    let courses: CourseEntity[] = [];
    if (searchCourseCodeDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          courseCode: Like(`${searchCourseCodeDto.courseCode}%`),
          id: MoreThan(searchCourseCodeDto.cursorId),
          year: searchCourseCodeDto.year,
          semester: searchCourseCodeDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          courseCode: Like(`${searchCourseCodeDto.courseCode}%`),
          year: searchCourseCodeDto.year,
          semester: searchCourseCodeDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }
    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 전공 과목명 검색 (최소 3글자 이상 입력 )
  async searchMajorCourseName(
    major: string,
    searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    if (!major) throwKukeyException('MAJOR_REQUIRED');

    let courses = [];

    if (searchCourseNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          courseName: Like(`%${searchCourseNameDto.courseName}%`),
          major: major,
          category: 'Major',
          id: MoreThan(searchCourseNameDto.cursorId),
          year: searchCourseNameDto.year,
          semester: searchCourseNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          courseName: Like(`%${searchCourseNameDto.courseName}%`),
          major: major,
          category: 'Major',
          year: searchCourseNameDto.year,
          semester: searchCourseNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 전공 교수님 성함 검색
  async searchMajorProfessorName(
    major: string,
    searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<PaginatedCoursesDto> {
    if (!major) {
      throwKukeyException('MAJOR_REQUIRED');
    }
    let courses = [];

    if (searchProfessorNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          professorName: Like(`%${searchProfessorNameDto.professorName}%`),
          major: major,
          category: 'Major',
          id: MoreThan(searchProfessorNameDto.cursorId),
          year: searchProfessorNameDto.year,
          semester: searchProfessorNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          professorName: Like(`%${searchProfessorNameDto.professorName}%`),
          major: major,
          category: 'Major',
          year: searchProfessorNameDto.year,
          semester: searchProfessorNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 교양 과목명 검색 (최소 3글자 이상 입력)
  async searchGeneralCourseName(
    searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    let courses = [];

    if (searchCourseNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          courseName: Like(`%${searchCourseNameDto.courseName}%`),
          category: 'General Studies',
          id: MoreThan(searchCourseNameDto.cursorId),
          year: searchCourseNameDto.year,
          semester: searchCourseNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          courseName: Like(`%${searchCourseNameDto.courseName}%`),
          category: 'General Studies',
          year: searchCourseNameDto.year,
          semester: searchCourseNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 교양 교수님 성함 검색
  async searchGeneralProfessorName(
    searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<PaginatedCoursesDto> {
    let courses = [];

    if (searchProfessorNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          professorName: Like(`%${searchProfessorNameDto.professorName}%`),
          category: 'General Studies',
          id: MoreThan(searchProfessorNameDto.cursorId),
          year: searchProfessorNameDto.year,
          semester: searchProfessorNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          professorName: Like(`%${searchProfessorNameDto.professorName}%`),
          category: 'General Studies',
          year: searchProfessorNameDto.year,
          semester: searchProfessorNameDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 교양 리스트 반환
  async getGeneralCourses(
    getGeneralCourseDto: GetGeneralCourseDto,
  ): Promise<PaginatedCoursesDto> {
    let courses = [];
    if (getGeneralCourseDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          category: 'General Studies',
          id: MoreThan(getGeneralCourseDto.cursorId),
          year: getGeneralCourseDto.year,
          semester: getGeneralCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          category: 'General Studies',
          year: getGeneralCourseDto.year,
          semester: getGeneralCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 전공 리스트 반환
  async getMajorCourses(
    getMajorCourseDto: GetMajorCourseDto,
  ): Promise<PaginatedCoursesDto> {
    if (!getMajorCourseDto.major) throwKukeyException('MAJOR_REQUIRED');
    let courses = [];
    if (getMajorCourseDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          category: 'Major',
          major: getMajorCourseDto.major,
          id: MoreThan(getMajorCourseDto.cursorId),
          year: getMajorCourseDto.year,
          semester: getMajorCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          category: 'Major',
          major: getMajorCourseDto.major,
          year: getMajorCourseDto.year,
          semester: getMajorCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 학문의 기초 리스트 반환
  async getAcademicFoundationCourses(
    getAcademicFoundationCourseDto: GetAcademicFoundationCourseDto,
  ): Promise<PaginatedCoursesDto> {
    if (!getAcademicFoundationCourseDto.college)
      throwKukeyException('COLLEGE_REQUIRED');
    let courses = [];
    if (getAcademicFoundationCourseDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          category: 'Academic Foundations',
          college: getAcademicFoundationCourseDto.college,
          id: MoreThan(getAcademicFoundationCourseDto.cursorId),
          year: getAcademicFoundationCourseDto.year,
          semester: getAcademicFoundationCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: {
          category: 'Academic Foundations',
          college: getAcademicFoundationCourseDto.college,
          year: getAcademicFoundationCourseDto.year,
          semester: getAcademicFoundationCourseDto.semester,
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }
    return await this.mappingCourseDetailsToCourses(courses);
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

  private async runSearchCoursesQuery(
    searchCoursesWithKeywordDto: SearchCoursesWithKeywordDto,
    options?: { major?: string; college?: string; category?: string },
  ): Promise<CourseEntity[]> {
    const { keyword, cursorId, year, semester } = searchCoursesWithKeywordDto;

    const LIMIT = PaginatedCoursesDto.LIMIT;

    let queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.courseDetails', 'courseDetails')
      .where('course.year = :year', { year })
      .andWhere('course.semester = :semester', { semester });

    // Optional: 추가 조건 적용
    if (options?.major) {
      queryBuilder = queryBuilder.andWhere('course.major = :major', {
        major: options.major,
      });
    }

    if (options?.college) {
      queryBuilder = queryBuilder.andWhere('course.college = :college', {
        college: options.college,
      });
    }

    if (options?.category) {
      queryBuilder = queryBuilder.andWhere('course.category = :category', {
        category: options.category,
      });
    }

    // 검색 조건(LIKE)
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

    return await queryBuilder.getMany();
  }
}
