import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiTags } from '@nestjs/swagger';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SearchCourseCodeDto } from './dto/search-course-code.dto';
import { SearchCourseNameDto } from './dto/search-course-name.dto';
import { SearchProfessorNameDto } from './dto/search-professor-name.dto';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';
import { CourseDocs } from 'src/decorators/docs/course.decorator';

@ApiTags('course')
@CourseDocs
@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  // 학수번호 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-course-code')
  async searchCourseCode(
    @Query() searchCourseCodeDto: SearchCourseCodeDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchCourseCode(searchCourseCodeDto);
  }

  // 전공 -- 과목명 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-major-course-name')
  async searchMajorCourseName(
    @Query('major') major: string,
    @Query() searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchMajorCourseName(
      major,
      searchCourseNameDto,
    );
  }

  // 교양 - 과목명 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-general-course-name')
  async searchGeneralCourseName(
    @Query() searchCourseNameDto: SearchCourseNameDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchGeneralCourseName(
      searchCourseNameDto,
    );
  }

  // 전공 - 교수님 성함 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-major-professor-name')
  async searchMajorProfessorName(
    @Query('major') major: string,
    @Query() searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchMajorProfessorName(
      major,
      searchProfessorNameDto,
    );
  }

  // 교양 - 교수님 성함 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-general-professor-name')
  async searchGeneralProfessorName(
    @Query() searchProfessorNameDto: SearchProfessorNameDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchGeneralProfessorName(
      searchProfessorNameDto,
    );
  }

  // 교양 리스트
  @UseGuards(JwtAuthGuard)
  @Get('general')
  async getGeneralCourses(
    @Query('cursorId') cursorId?: number,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.getGeneralCourses(cursorId);
  }

  // 전공 리스트 (학부별)
  @UseGuards(JwtAuthGuard)
  @Get('major')
  async getMajorCourses(
    @Query('major') major: string,
    @Query('cursorId') cursorId?: number,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.getMajorCourses(major, cursorId);
  }

  // 학문의 기초 리스트
  @UseGuards(JwtAuthGuard)
  @Get('academic-foundation')
  async getAcademicFoundationCourses(
    @Query('college') college: string,
    @Query('cursorId') cursorId?: number,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.getAcademicFoundationCourses(
      college,
      cursorId,
    );
  }

  @Get('/:courseId')
  async getCourse(
    @Param('courseId') courseId: number,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseService.getCourse(courseId);
  }
}
