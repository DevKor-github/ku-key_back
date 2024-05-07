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
  @Get('search')
  async getCourseSearch(
    @Body() searchCourseDto : SearchCourseDto,
  ): Promise<CourseEntity[]> {
    return await this.courseService.getCourseSearch(searchCourseDto);
  }

  @Get('general')
  async getGeneralCourses(): Promise<CourseEntity[]> {
    return await this.courseService.getGeneralCourses();
  }

  @Get('major')
  async getMajorCourses(
    @Query('major') major: string,
  ): Promise<CourseEntity[]> {
    return await this.courseService.getMajorCourses(major);
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
    return await this.courseService.updateCourseDetail(updateCourseDetailDto,courseDetailId);
  }

  @Patch('/:courseId')
  async updateCourse(
    @Param('courseId') courseId: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    return await this.courseService.updateCourse(updateCourseDto, courseId);
  }
}
