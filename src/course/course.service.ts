import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { Like } from 'typeorm';
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

  async getAllCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find();
  }

  async getCourse(courseId: number): Promise<CommonCourseResponseDto> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
    });
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
  ): Promise<boolean> {
    const course = await this.courseRepository.findOne({
      where: { courseCode: Like(`${courseCode}%`), professorName },
    });

    return course ? true : false;
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
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find({
      where: { courseCode: Like(`${searchCourseCodeDto.courseCode}%`) },
    });
  }

  // 전공 과목명 검색 (띄어쓰기로 단어 구분)
  async searchMajorCourseName(
    major: string,
    searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    if (!major) throw new BadRequestException('전공을 입력하세요!');

    try {
      const words = searchCourseNameDto.courseName
        .split(/\s+/)
        .filter((word) => word.length);
      const searchPattern = words.map((word) => `(?=.*\\b${word}\\b)`).join('');
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .where(`course.courseName REGEXP :pattern`, {
          pattern: `^${searchPattern}.*$`,
        })
        .andWhere('course.major = :major', { major })
        .andWhere('course.category = :category', { category: 'Major' })
        .orderBy('course.id', 'ASC')
        .limit(5);

      if (searchCourseNameDto.cursorId) {
        queryBuilder.andWhere('course.id > :cursorId', {
          cursorId: searchCourseNameDto.cursorId,
        });
      }
      const majorCourses = await queryBuilder.getMany();
      const response = majorCourses.map(
        (course) => new CommonCourseResponseDto(course),
      );
      return new PaginatedCoursesDto(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 전공 교수님 성함 검색
  async searchMajorProfessorName(
    major: string,
    searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<CommonCourseResponseDto[]> {
    if (!major) {
      throw new BadRequestException('전공을 입력하세요!');
    }

    return await this.courseRepository.find({
      where: {
        professorName: Like(`%${searchProfessorNameDto.professorName}%`),
        major: major,
        category: 'Major',
      },
    });
  }

  // 교양 과목명 검색 (띄어쓰기로 단어 구분)
  async searchGeneralCourseName(
    searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    try {
      const words = searchCourseNameDto.courseName
        .split(/\s+/)
        .filter((word) => word.length);
      const searchPattern = words.map((word) => `(?=.*\\b${word}\\b)`).join('');
      const queryBuilder = await this.courseRepository
        .createQueryBuilder('course')
        .where(`course.courseName REGEXP :pattern`, {
          pattern: `^${searchPattern}.*$`,
        })
        .andWhere('course.category = :category', {
          category: 'General Studies',
        })
        .orderBy('course.id', 'ASC')
        .limit(5);

      if (searchCourseNameDto.cursorId) {
        queryBuilder.andWhere('course.id > :cursorId', {
          cursorId: searchCourseNameDto.cursorId,
        });
      }
      const generalCourses = await queryBuilder.getMany();
      const response = generalCourses.map(
        (course) => new CommonCourseResponseDto(course),
      );
      return new PaginatedCoursesDto(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 교양 교수님 성함 검색
  async searchGeneralProfessorName(
    searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<CourseEntity[]> {
    return await this.courseRepository.find({
      where: {
        professorName: Like(`%${searchProfessorNameDto.professorName}%`),
        category: 'General Studies',
      },
    });
  }

  // 교양 리스트 반환
  async getGeneralCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find({
      where: { category: 'General Studies' },
    });
  }

  // 전공 리스트 반환
  async getMajorCourses(major: string): Promise<CommonCourseResponseDto[]> {
    if (!major) throw new BadRequestException('Major is required!');
    return await this.courseRepository.find({
      where: { category: 'Major', major: major },
    });
  }

  // 학문의 기초 리스트 반환
  async getAcademicFoundationCourses(
    college: string,
  ): Promise<CommonCourseResponseDto[]> {
    if (!college) throw new BadRequestException('College is required!');
    return await this.courseRepository.find({
      where: { category: 'Academic Foundations', college: college },
    });
  }

  async updateCourseTotalRate(
    courseIds: number[],
    totalRate: number,
  ): Promise<void> {
    for (const id of courseIds) {
      await this.courseRepository.update(id, {
        totalRate: parseFloat(totalRate.toFixed(1)),
      });
    }
  }
}
