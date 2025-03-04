import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginatedCoursesDto } from './dto/paginated-courses.dto';
import { CourseDocs } from 'src/decorators/docs/course.decorator';
import { SearchCourseNewDto } from './dto/search-course-new.dto';
import { GetRecommendationCoursesRequestDto } from './dto/get-recommendation-courses-request.dto';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async searchCourses(
    @Query() searchCourseNewDto: SearchCourseNewDto,
  ): Promise<PaginatedCoursesDto> {
    return await this.courseService.searchCourses(searchCourseNewDto);
  }
}
