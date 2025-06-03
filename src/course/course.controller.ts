import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';
import { CourseDocs } from 'src/decorators/docs/course.decorator';
import { SearchCourseNewDto } from './dto/search-course-new.dto';
import { GetRecommendationCoursesRequestDto } from './dto/get-recommendation-courses-request.dto';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { SearchAllTimeCoursesRequestDto } from './dto/search-all-time-courses-request.dto';
import { SearchAllTimeCoursesResponseDto } from './dto/search-all-time-courses-response.dto';

@ApiTags('course')
@CourseDocs
@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('recommendation')
  async getRecommendationCourses(
    @Query()
    getRecommendationCoursesRequestDto: GetRecommendationCoursesRequestDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseService.getRecommendationCourses(
      getRecommendationCoursesRequestDto,
    );
  }

  @Get('all-time')
  async searchAllTimeCourses(
    @Query() searchAllTimeCoursesRequestDto: SearchAllTimeCoursesRequestDto,
  ): Promise<SearchAllTimeCoursesResponseDto> {
    return await this.courseService.searchAllTimeCourses(
      searchAllTimeCoursesRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async searchCourses(
    @Query() searchCourseNewDto: SearchCourseNewDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchCourses(searchCourseNewDto);
  }
}
