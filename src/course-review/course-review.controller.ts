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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('course-review')
@Controller('course-review')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class CourseReviewController {
  constructor(private courseReviewService: CourseReviewService) {}

  // 교환학생은 재수강 하지 않는다는 전제하에
  @ApiOperation({
    summary: '강의평 추가',
    description:
      '강의평을 추가합니다. 유저가 해당 강의에 대해 이미 강의평을 등록했으면 더 이상 등록되지 않습니다.',
  })
  @ApiBody({
    type: CreateCourseReviewRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '강의평 등록 성공',
    type: CourseReviewResponseDto,
  })
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
  @ApiOperation({
    summary: '강의평 요약 조회',
    description:
      '해당 교수의 해당 강의에 대한 강의평들을 종합한 강의평 요약을 조회합니다.',
  })
  @ApiQuery({
    name: 'courseCode',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'professorName',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '종합 강의평 조회 성공',
    type: GetCourseReviewSummaryResponseDto,
  })
  @Get('summary')
  async getCourseReviewSummary(
    @Query() getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewSummaryResponseDto> {
    return await this.courseReviewService.getCourseReviewSummary(
      getCourseReviewsRequestDto,
    );
  }

  @ApiOperation({
    summary: '내 강의평 조회',
    description: '내가 작성한 강의평을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내 강의평 조회 성공',
    type: CourseReviewResponseDto,
    isArray: true,
  })
  @Get('my-course-reviews')
  async getMyCourseReviews(
    @User() user: AuthorizedUserDto,
  ): Promise<CourseReviewResponseDto[]> {
    return await this.courseReviewService.getMyCourseReviews(user);
  }

  @ApiOperation({
    summary: '이미 해당 강의에 대해 강의평 작성했는 지 조회',
    description:
      '해당 강의에 대해 이미 강의평을 작성했으면 true, 아니면 false 반환',
  })
  @ApiResponse({
    status: 200,
    description: '강의평 작성 여부 조회 성공',
  })
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
  @ApiOperation({
    summary: '강의평 조회',
    description:
      '해당 교수의 해당 강의에 대해 강의평을 조회합니다. 열람권이 없으면 열람할 수 없습니다.',
  })
  @ApiQuery({
    name: 'courseCode',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'professorName',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'criteria',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'direction',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '강의평 조회 성공',
    type: GetCourseReviewsResponseDto,
  })
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
  @ApiOperation({
    summary: '강의평 추천',
    description:
      '강의평에 추천을 누릅니다. 이미 추천한 강의평이면 추천이 취소됩니다. 내가 쓴 강의평은 추천할 수 없습니다.',
  })
  @ApiParam({
    name: 'courseReviewId',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: '강의평 추천/추천 취소 성공',
    type: CourseReviewResponseDto,
  })
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
