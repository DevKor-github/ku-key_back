import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCourseReviewRequestDto } from './dto/create-course-review-request.dto';
import { CourseReviewResponseDto } from './dto/course-review-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetCourseReviewsRequestDto } from './dto/get-course-reviews-request.dto';
import { GetCourseReviewsResponseDto } from './dto/get-course-reviews-response.dto';
import { GetCourseReviewSummaryResponseDto } from './dto/get-course-review-summary-response.dto';
import { CourseReviewsFilterDto } from './dto/course-reviews-filter.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { CourseReviewDocs } from 'src/decorators/docs/course-review.decorator';

@ApiTags('course-review')
@Controller('course-review')
@ApiBearerAuth('accessToken')
@CourseReviewDocs
@UseGuards(JwtAuthGuard)
export class CourseReviewController {
  constructor(private courseReviewService: CourseReviewService) {}

  // 교환학생은 재수강 하지 않는다는 전제하에
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createCourseReview(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() createCourseReviewRequestDto: CreateCourseReviewRequestDto,
  ): Promise<CourseReviewResponseDto> {
    return await this.courseReviewService.createCourseReview(
      transactionManager,
      user,
      createCourseReviewRequestDto,
    );
  }

  // 종합 강의평 조회
  @Get('summary')
  async getCourseReviewSummary(
    @Query() getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewSummaryResponseDto> {
    return await this.courseReviewService.getCourseReviewSummary(
      getCourseReviewsRequestDto,
    );
  }

  @Get('my-course-reviews')
  async getMyCourseReviews(
    @User() user: AuthorizedUserDto,
  ): Promise<CourseReviewResponseDto[]> {
    return await this.courseReviewService.getMyCourseReviews(user);
  }

  @Get('check-submission')
  async checkCourseReviewSubmission(
    @User() user: AuthorizedUserDto,
    @Query() getCourseReviewRequestDto: GetCourseReviewsRequestDto,
  ): Promise<boolean> {
    return await this.courseReviewService.checkCourseReviewSubmission(
      user,
      getCourseReviewRequestDto,
    );
  }

  // 강의평 조회
  @Get()
  async getCourseReviews(
    @User() user: AuthorizedUserDto,
    @Query() getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
    @Query() courseReviewsFilterDto: CourseReviewsFilterDto,
  ): Promise<GetCourseReviewsResponseDto> {
    return await this.courseReviewService.getCourseReviews(
      user,
      getCourseReviewsRequestDto,
      courseReviewsFilterDto,
    );
  }

  // 강의평 추천
  @Post('recommend/:courseReviewId')
  @UseInterceptors(TransactionInterceptor)
  async toggleRecommendCourseReview(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Param('courseReviewId') courseReviewId: number,
  ): Promise<CourseReviewResponseDto> {
    return await this.courseReviewService.toggleRecommendCourseReview(
      transactionManager,
      user,
      courseReviewId,
    );
  }
}
