import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseService } from './course.service';
import { CreateCourseDetailDto } from './dto/create-course-detail.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseDetailDto } from './dto/update-course-detail.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { CommonCourseDetailResponseDto } from './dto/common-course-detail-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: '강의 등록', description: '강의를 등록합니다.' })
  @ApiBody({
    type: CreateCourseDto,
  })
  @ApiResponse({
    status: 201,
    description: '강의 등록 성공 시',
    type: CommonCourseResponseDto,
  })
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseService.createCourse(createCourseDto);
  }

  @Post('detail')
  @ApiOperation({
    summary: '강의 상세 등록',
    description: '강의 세부 정보를 등록합니다.',
  })
  @ApiBody({
    type: CreateCourseDetailDto,
  })
  @ApiResponse({
    status: 201,
    description: '강의 상세 등록 성공 시',
    type: CommonCourseDetailResponseDto,
  })
  async createCourseDetail(
    @Body() createCourseDetailDto: CreateCourseDetailDto,
  ): Promise<CommonCourseDetailResponseDto> {
    return await this.courseService.createCourseDetail(createCourseDetailDto);
  }

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
  @ApiBody({
    type: SearchCourseDto,
  })
  @ApiResponse({
    status: 200,
    description: '학수번호로 강의 검색 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async searchCourseCode(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.searchCourseCode(searchCourseDto);
  }

  // 전공 - 과목명 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-major-course-name')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '전공 과목명 강의 검색',
    description: '전공 과목명을 입력하여 강의를 검색합니다.',
  })
  @ApiBody({
    type: SearchCourseDto,
  })
  @ApiQuery({
    name: 'major',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '전공 과목명으로 강의 검색 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async searchMajorCourseName(
    @Query('major') major: string,
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.searchMajorCourseName(
      major,
      searchCourseDto,
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
  @ApiBody({
    type: SearchCourseDto,
  })
  @ApiResponse({
    status: 200,
    description: '교양 과목명으로 강의 검색 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async searchGeneralCourseName(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.searchGeneralCourseName(searchCourseDto);
  }

  // 전공 - 교수님 성함 검색
  @UseGuards(JwtAuthGuard)
  @Get('search-major-professor-name')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '전공 과목 담당 교수님 성함으로 강의 검색',
    description: '전공 과목 담당 교수님 성함을 입력하여 강의를 검색합니다.',
  })
  @ApiBody({
    type: SearchCourseDto,
  })
  @ApiQuery({
    name: 'major',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '전공 과목 담당 교수님 성함으로 강의 검색 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async searchMajorProfessorName(
    @Query('major') major: string,
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.searchMajorProfessorName(
      major,
      searchCourseDto,
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
  @ApiBody({
    type: SearchCourseDto,
  })
  @ApiResponse({
    status: 200,
    description: '교양 담당 교수님 성함으로 강의 검색 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async searchGeneralProfessorName(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.searchGeneralProfessorName(searchCourseDto);
  }

  // 교양 리스트
  @UseGuards(JwtAuthGuard)
  @Get('general')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '교양 강의 조회',
    description: '모든 교양 강의를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '교양 강의 조회 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async getGeneralCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.getGeneralCourses();
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
  @ApiResponse({
    status: 200,
    description: '전공 강의 조회 성공 시',
    type: CommonCourseResponseDto,
    isArray: true,
  })
  async getMajorCourses(
    @Query('major') major: string,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.getMajorCourses(major);
  }

  // 학문의 기초 리스트
  @UseGuards(JwtAuthGuard)
  @Get('academicFoundation')
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

  @Patch('detail/:courseDetailId')
  @ApiOperation({
    summary: '강의 세부 사항 수정',
    description: '특정 강의의 세부 사항을 수정합니다.',
  })
  @ApiParam({
    name: 'courseDetailId',
    description: '특정 강의 세부 사항 ID',
  })
  @ApiBody({
    type: UpdateCourseDetailDto,
  })
  @ApiResponse({
    status: 200,
    description: '강의 세부 사항 수정 성공 시',
    type: CommonCourseDetailResponseDto,
  })
  async updateCourseDetail(
    @Param('courseDetailId') courseDetailId: number,
    @Body() updateCourseDetailDto: UpdateCourseDetailDto,
  ): Promise<CommonCourseDetailResponseDto> {
    return await this.courseService.updateCourseDetail(
      updateCourseDetailDto,
      courseDetailId,
    );
  }

  @Patch('/:courseId')
  @ApiOperation({
    summary: '강의 정보 수정',
    description: '특정 강의의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'courseId',
    description: '특정 강의 ID',
  })
  @ApiBody({
    type: UpdateCourseDto,
  })
  @ApiResponse({
    status: 200,
    description: '강의 정보 수정 성공 시',
    type: CommonCourseResponseDto,
  })
  async updateCourse(
    @Param('courseId') courseId: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseService.updateCourse(updateCourseDto, courseId);
  }
}
