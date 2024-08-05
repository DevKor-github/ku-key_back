import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { EntityManager, Like, MoreThan } from 'typeorm';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { SearchCourseCodeDto } from './dto/search-course-code.dto';
import { SearchCourseNameDto } from './dto/search-course-name.dto';
import { SearchProfessorNameDto } from './dto/search-professor-name.dto';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';

@Injectable()
export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private courseDetailRepository: CourseDetailRepository,
  ) {}

  async getCourse(courseId: number): Promise<CommonCourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseDetails'],
    });

    if (!course) {
      throw new NotFoundException('Course not found!');
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
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: { courseCode: Like(`${searchCourseCodeDto.courseCode}%`) },
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
    if (!major) throw new BadRequestException('전공을 입력하세요!');

    let courses = [];

    if (searchCourseNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          courseName: Like(`%${searchCourseNameDto.courseName}%`),
          major: major,
          category: 'Major',
          id: MoreThan(searchCourseNameDto.cursorId),
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
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);

    // try {
    //   const words = searchCourseNameDto.courseName
    //     .split(/\s+/)
    //     .filter((word) => word.length);
    //   const searchPattern = words.map((word) => `(?=.*\\b${word}\\b)`).join('');
    //   const queryBuilder = this.courseRepository
    //     .createQueryBuilder('course')
    //     .leftJoinAndSelect('course.courseDetails', 'courseDetails')
    //     .where(`course.courseName REGEXP :pattern`, {
    //       pattern: `^${searchPattern}.*$`,
    //     })
    //     .andWhere('course.major = :major', { major })
    //     .andWhere('course.category = :category', { category: 'Major' })
    //     .orderBy('course.id', 'ASC')
    //     .limit(21);

    //   if (searchCourseNameDto.cursorId) {
    //     queryBuilder.andWhere('course.id > :cursorId', {
    //       cursorId: searchCourseNameDto.cursorId,
    //     });
    //   }
    //   const majorCourses = await queryBuilder.getMany();
    //   return await this.mappingCourseDetailsToCourses(majorCourses);
  }

  // 전공 교수님 성함 검색
  async searchMajorProfessorName(
    major: string,
    searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<PaginatedCoursesDto> {
    if (!major) {
      throw new BadRequestException('전공을 입력하세요!');
    }
    let courses = [];

    if (searchProfessorNameDto.cursorId) {
      courses = await this.courseRepository.find({
        where: {
          professorName: Like(`%${searchProfessorNameDto.professorName}%`),
          major: major,
          category: 'Major',
          id: MoreThan(searchProfessorNameDto.cursorId),
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
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
    // try {
    //   const words = searchCourseNameDto.courseName
    //     .split(/\s+/)
    //     .filter((word) => word.length);
    //   const searchPattern = words.map((word) => `(?=.*\\b${word}\\b)`).join('');
    //   const queryBuilder = await this.courseRepository
    //     .createQueryBuilder('course')
    //     .leftJoinAndSelect('course.courseDetails', 'courseDetails')
    //     .where(`course.courseName REGEXP :pattern`, {
    //       pattern: `^${searchPattern}.*$`,
    //     })
    //     .andWhere('course.category = :category', {
    //       category: 'General Studies',
    //     })
    //     .orderBy('course.id', 'ASC')
    //     .limit(21);

    //   if (searchCourseNameDto.cursorId) {
    //     queryBuilder.andWhere('course.id > :cursorId', {
    //       cursorId: searchCourseNameDto.cursorId,
    //     });
    //   }
    //   const generalCourses = await queryBuilder.getMany();
    //   return await this.mappingCourseDetailsToCourses(generalCourses);
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
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 교양 리스트 반환
  async getGeneralCourses(cursorId: number): Promise<PaginatedCoursesDto> {
    let courses = [];
    if (cursorId) {
      courses = await this.courseRepository.find({
        where: { category: 'General Studies', id: MoreThan(cursorId) },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: { category: 'General Studies' },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 전공 리스트 반환
  async getMajorCourses(
    major: string,
    cursorId: number,
  ): Promise<PaginatedCoursesDto> {
    if (!major) throw new BadRequestException('Major is required!');
    let courses = [];
    if (cursorId) {
      courses = await this.courseRepository.find({
        where: { category: 'Major', major: major, id: MoreThan(cursorId) },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: { category: 'Major', major: major },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    }

    return await this.mappingCourseDetailsToCourses(courses);
  }

  // 학문의 기초 리스트 반환
  async getAcademicFoundationCourses(
    college: string,
    cursorId: number,
  ): Promise<PaginatedCoursesDto> {
    if (!college) throw new BadRequestException('College is required!');
    let courses = [];
    if (cursorId) {
      courses = await this.courseRepository.find({
        where: {
          category: 'Academic Foundations',
          college: college,
          id: MoreThan(cursorId),
        },
        order: { id: 'ASC' },
        take: 21,
        relations: ['courseDetails'],
      });
    } else {
      courses = await this.courseRepository.find({
        where: { category: 'Academic Foundations', college: college },
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
}
