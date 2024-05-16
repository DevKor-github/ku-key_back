import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseService } from './course.service';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CreateCourseDetailDto } from './dto/create-course-detail.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseDetailDto } from './dto/update-course-detail.dto';
import { SearchCourseDto } from './dto/search-course.dto';

@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post()
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseEntity> {
    return await this.courseService.createCourse(createCourseDto);
  }

  @Post('detail')
  async createCourseDetail(
    @Body() createCourseDetailDto: CreateCourseDetailDto,
  ): Promise<CourseDetailEntity> {
    return await this.courseService.createCourseDetail(createCourseDetailDto);
  }

  @Get()
  async getAllCourses(): Promise<CourseEntity[]> {
    return await this.courseService.getAllCourses();
  }

  // 학수번호 검색
  @Get('searchCourseCode')
  async searchCourseCode(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.searchCourseCode(searchCourseDto);
  }

  // 전공과목 과목명 검색
  @Get('searchMajorCourseName')
  async searchMajorCourseName(
    @Query('major') major: string,
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.searchMajorCourseName(
      major,
      searchCourseDto,
    );
  }

  // 전공과목 교수님 성함 검색
  @Get('searchMajorProfessorName')
  async searchMajorProfessorName(
    @Query('major') major: string,
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.searchMajorProfessorName(
      major,
      searchCourseDto,
    );
  }

  // 교양과목 과목명 검색
  @Get('searchGeneralCourseName')
  async searchGeneralCourseName(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.searchGeneralCourseName(searchCourseDto);
  }
  // 교양과목 교수님 성함 검색
  @Get('searchGeneralProfessorName')
  async searchGeneralProfessorName(
    @Body() searchCourseDto: SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.searchGeneralProfessorName(searchCourseDto);
  }

  // 교양 리스트
  @Get('general')
  async getGeneralCourses(): Promise<CourseEntity[]> {
    return await this.courseService.getGeneralCourses();
  }

  // 전공 리스트 (학부별)
  @Get('major')
  async getMajorCourses(
    @Query('major') major: string,
  ): Promise<CourseEntity[]> {
    return await this.courseService.getMajorCourses(major);
  }

  // 학문의 기초 리스트
  @Get('academicFoundation')
  async getAcademicFoundationCourses(
    @Query('college') college: string,
  ): Promise<CourseEntity[]> {
    return await this.courseService.getAcademicFoundationCourses(college);
  }

  @Get('/:courseId')
  async getCourse(@Param('courseId') courseId: number): Promise<CourseEntity> {
    return await this.courseService.getCourse(courseId);
  }

  @Patch('detail/:courseDetailId')
  async updateCourseDetail(
    @Param('courseDetailId') courseDetailId: number,
    @Body() updateCourseDetailDto: UpdateCourseDetailDto,
  ): Promise<CourseDetailEntity> {
    return await this.courseService.updateCourseDetail(
      updateCourseDetailDto,
      courseDetailId,
    );
  }

  @Patch('/:courseId')
  async updateCourse(
    @Param('courseId') courseId: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    return await this.courseService.updateCourse(updateCourseDto, courseId);
  }
}
