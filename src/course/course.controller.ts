import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SearchCourseCodeDto } from './dto/search-course-code.dto';
import { SearchCourseNameDto } from './dto/search-course-name.dto';
import { SearchProfessorNameDto } from './dto/search-professor-name.dto';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get()
  @ApiOperation({
    summary: '모든 강의 조회',
    description: '등록된 모든 강의를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '모든 강의 조회 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async getAllCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.getAllCourses();
  }

  // 학수번호 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-course-code')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '학수번호로 강의 검색',
    description: '학수번호를 입력하여 강의를 검색합니다.',
  })
  @ApiQuery({
    name: 'courseCode',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '학수번호로 강의 검색 성공 시',
    type: PaginatedCoursesDto,
  })
  async searchCourseCode(
    @Query() searchCourseCodeDto: SearchCourseCodeDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchCourseCode(searchCourseCodeDto);
  }

  // 전공 - 과목명 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-major-course-name')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '전공 과목명 강의 검색',
    description: '전공 과목명을 입력하여 강의를 검색합니다.',
  })
  @ApiQuery({
    name: 'major',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'courseName',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursor ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '전공 과목명으로 강의 검색 성공 시',
    type: PaginatedCoursesDto,
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '교양 과목명 강의 검색',
    description: '교양 과목명을 입력하여 강의를 검색합니다.',
  })
  @ApiQuery({
    name: 'courseName',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursor ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '교양 과목명으로 강의 검색 성공 시',
    type: PaginatedCoursesDto,
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '전공 과목 담당 교수님 성함으로 강의 검색',
    description: '전공 과목 담당 교수님 성함을 입력하여 강의를 검색합니다.',
  })
  @ApiQuery({
    name: 'major',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'professorName',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursor ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '전공 과목 담당 교수님 성함으로 강의 검색 성공 시',
    type: PaginatedCoursesDto,
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '교양 담당 교수님 성함으로 강의 검색',
    description: '교양 담당 교수님 성함을 입력하여 강의를 검색합니다.',
  })
  @ApiQuery({
    name: 'professorName',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursor ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '교양 담당 교수님 성함으로 강의 검색 성공 시',
    type: PaginatedCoursesDto,
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '교양 강의 조회',
    description: '모든 교양 강의를 조회합니다.',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '교양 강의 조회 성공 시',
    type: PaginatedCoursesDto,
  })
  async getGeneralCourses(
    @Query('cursorId') cursorId?: number,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.getGeneralCourses(cursorId);
  }

  // 전공 리스트 (학부별)
  @UseGuards(JwtAuthGuard)
  @Get('major')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '전공 강의 조회',
    description: '해당 과의 모든 전공 강의를 조회합니다.',
  })
  @ApiQuery({
    name: 'major',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'cursorId',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '전공 강의 조회 성공 시',
    type: PaginatedCoursesDto,
  })
  async getMajorCourses(
    @Query('major') major: string,
    @Query('cursorId') cursorId?: number,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.getMajorCourses(major, cursorId);
  }

  // 학문의 기초 리스트
  @UseGuards(JwtAuthGuard)
  @Get('academic-foundation')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '학문의 기초 강의 조회',
    description: '해당 단과대의 모든 학문의 기초 강의를 조회합니다.',
  })
  @ApiQuery({
    name: 'college',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '학문의 기초 강의 조회 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async getAcademicFoundationCourses(
    @Query('college') college: string,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.getAcademicFoundationCourses(college);
  }

  @Get('/:courseId')
  @ApiOperation({
    summary: '특정 강의 조회',
    description: '특정 강의를 조회합니다.',
  })
  @ApiParam({
    name: 'courseId',
    description: '특정 강의 ID',
  })
  @ApiResponse({
    status: 200,
    description: '특정 강의 조회 성공 시',
    type: CommonCourseResponseDto,
  })
  async getCourse(
    @Param('courseId') courseId: number,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseService.getCourse(courseId);
  }
}
