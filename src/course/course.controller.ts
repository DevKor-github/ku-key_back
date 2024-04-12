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
  async getCourseSearch(
    @Query('search') search: string,
  ): Promise<CourseEntity[]> {
    return await this.courseService.getCourseSearch(search);
  }

  @Get()
  async getAllCourses(): Promise<CourseEntity[]> {
    return await this.courseService.getAllCourses();
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
