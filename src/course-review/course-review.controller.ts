import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCourseReviewRequestDto } from './dto/create-course-review-request.dto';
import { CreateCourseReviewResponseDto } from './dto/create-course-review-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
    type: CreateCourseReviewResponseDto,
  })
  @Post()
  async createCourseReview(
    @User() user: AuthorizedUserDto,
    @Body() createCourseReviewDto: CreateCourseReviewRequestDto,
  ): Promise<CreateCourseReviewResponseDto> {
    return await this.courseReviewService.createCourseReview(
      user,
      createCourseReviewDto,
    );
  }
}
