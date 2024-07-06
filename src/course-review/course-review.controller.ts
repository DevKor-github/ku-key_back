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
  async createCourseReview(
    @User() user: AuthorizedUserDto,
    @Body() createCourseReviewRequestDto: CreateCourseReviewRequestDto,
  ): Promise<CourseReviewResponseDto> {
    return await this.courseReviewService.createCourseReview(
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
    @User() user: AuthorizedUserDto,
    @Query() getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewSummaryResponseDto> {
    return await this.courseReviewService.getCourseReviewSummary(
      user,
      getCourseReviewsRequestDto,
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
  @ApiResponse({
    status: 200,
    description: '강의평 조회 성공',
    type: GetCourseReviewsResponseDto,
  })
  @Get()
  async getCourseReviews(
    @User() user: AuthorizedUserDto,
    @Query() getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewsResponseDto | []> {
    return await this.courseReviewService.getCourseReviews(
      user,
      getCourseReviewsRequestDto,
    );
  }

  // 강의평 추천
  @ApiOperation({
    summary: '강의평 추천',
    description: '강의평에 추천을 누릅니다.',
  })
  @ApiParam({
    name: 'courseReviewId',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '강의평 추천 성공',
    type: CourseReviewResponseDto,
  })
  @Patch('recommend/:courseReviewId')
  async recommendCourseReview(
    @User() user: AuthorizedUserDto,
    @Param('courseReviewId') courseReviewId: number,
  ): Promise<CourseReviewResponseDto> {
    return await this.courseReviewService.recommendCourseReview(
      user,
      courseReviewId,
    );
  }
}
