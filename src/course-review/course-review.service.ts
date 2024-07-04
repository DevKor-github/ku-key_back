import { ConflictException, Injectable } from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCourseReviewRequestDto } from './dto/create-course-review-request.dto';
import { CreateCourseReviewResponseDto } from './dto/create-course-review-response.dto';
import { CourseReviewRepository } from './course-review.repository';

@Injectable()
export class CourseReviewService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
  ) {}

  async createCourseReview(
    user: AuthorizedUserDto,
    createCourseReviewRequestDto: CreateCourseReviewRequestDto,
  ): Promise<CreateCourseReviewResponseDto> {
    // 유저가 이미 강의평을 등록했는 지 체크
    const isAlreadReviewed = await this.courseReviewRepository.findOne({
      where: {
        userId: user.id,
        courseCode: createCourseReviewRequestDto.courseCode,
        professorName: createCourseReviewRequestDto.professorName,
      },
    });
    if (isAlreadReviewed) {
      throw new ConflictException(
        '이미 해당 강의에 대한 강의평을 등록했습니다.',
      );
    }

    const courseReview = this.courseReviewRepository.create({
      ...createCourseReviewRequestDto,
      userId: user.id,
    });

    return await this.courseReviewRepository.save(courseReview);
  }
}
