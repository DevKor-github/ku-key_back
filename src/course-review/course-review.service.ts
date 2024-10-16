import { Injectable } from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCourseReviewRequestDto } from './dto/create-course-review-request.dto';
import { CourseReviewResponseDto } from './dto/course-review-response.dto';
import { GetCourseReviewsRequestDto } from './dto/get-course-reviews-request.dto';
import { UserService } from 'src/user/user.service';
import {
  GetCourseReviewsResponseDto,
  ReviewDto,
} from './dto/get-course-reviews-response.dto';
import { GetCourseReviewSummaryResponseDto } from './dto/get-course-review-summary-response.dto';
import { EntityManager, Repository } from 'typeorm';
import { CourseReviewRecommendEntity } from 'src/entities/course-review-recommend.entity';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { CourseReviewsFilterDto } from './dto/course-reviews-filter.dto';
import { CourseService } from 'src/course/course.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PointService } from 'src/user/point.service';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class CourseReviewService {
  constructor(
    @InjectRepository(CourseReviewEntity)
    private readonly courseReviewRepository: Repository<CourseReviewEntity>,
    @InjectRepository(CourseReviewRecommendEntity)
    private readonly courseReviewRecommendRepository: Repository<CourseReviewRecommendEntity>,
    private readonly userService: UserService,
    private readonly pointService: PointService,
    private readonly courseService: CourseService,
  ) {}

  async createCourseReview(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    createCourseReviewRequestDto: CreateCourseReviewRequestDto,
  ): Promise<CourseReviewResponseDto> {
    // 해당 학수번호-교수명과 일치하는 강의가 존재하는지 체크
    const course = await this.courseService.searchCourseCodeWithProfessorName(
      createCourseReviewRequestDto.courseCode,
      createCourseReviewRequestDto.professorName,
    );

    if (!course) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    // 유저가 이미 강의평을 등록했는 지 체크
    const isAlreadyReviewed = await transactionManager.findOne(
      CourseReviewEntity,
      {
        where: {
          userId: user.id,
          courseCode: createCourseReviewRequestDto.courseCode,
          professorName: createCourseReviewRequestDto.professorName,
        },
      },
    );

    if (isAlreadyReviewed) {
      throwKukeyException('COURSE_REVIEW_ALREADY_EXIST');
    }

    const courseReview = transactionManager.create(CourseReviewEntity, {
      ...createCourseReviewRequestDto,
      userId: user.id,
    });

    await transactionManager.save(courseReview);

    await this.pointService.changePoint(
      user.id,
      100,
      'Writing course review',
      transactionManager,
    );

    // 해당 강의에 대한 모든 강의평 조회
    const courseReviews = await transactionManager.find(CourseReviewEntity, {
      where: {
        courseCode: createCourseReviewRequestDto.courseCode,
        professorName: createCourseReviewRequestDto.professorName,
      },
    });

    // 강의평 점수들의 평균 계산
    const totalRate =
      courseReviews.reduce((sum, review) => sum + review.rate, 0) /
      courseReviews.length;

    const courses =
      await this.courseService.searchCoursesByCourseCodeAndProfessorName(
        createCourseReviewRequestDto.courseCode,
        createCourseReviewRequestDto.professorName,
      );
    const courseIds = courses.map((course) => course.id);
    await this.courseService.updateCourseTotalRate(
      courseIds,
      totalRate,
      transactionManager,
    );
    return new CourseReviewResponseDto(courseReview, user.username);
  }

  async getCourseReviewSummary(
    getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewSummaryResponseDto> {
    // 해당 학수번호-교수명과 일치하는 강의가 존재하는지 체크
    const course = await this.courseService.searchCourseCodeWithProfessorName(
      getCourseReviewsRequestDto.courseCode,
      getCourseReviewsRequestDto.professorName,
    );

    if (!course) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    const courseReviews = await this.courseReviewRepository.find({
      where: {
        courseCode: getCourseReviewsRequestDto.courseCode,
        professorName: getCourseReviewsRequestDto.professorName,
      },
    });

    if (courseReviews.length === 0) {
      // 강의평이 하나도 없으면
      return {
        totalRate: 0.0,
        reviewCount: 0,
        classLevel: 0,
        teamProject: 0,
        amountLearned: 0,
        teachingSkills: 0,
        attendance: 0,
        courseName: course.courseName,
      };
    }
    const reviewCount = courseReviews.length;
    const totalRate =
      courseReviews.reduce((sum, review) => sum + review.rate, 0) / reviewCount;
    const totalClassLevel =
      courseReviews.reduce((sum, review) => sum + review.classLevel, 0) /
      reviewCount;
    const totalTeamProject =
      courseReviews.reduce((sum, review) => sum + review.teamProject, 0) /
      reviewCount;
    const totalAmountLearned =
      courseReviews.reduce((sum, review) => sum + review.amountLearned, 0) /
      reviewCount;
    const totalTeachingSkills =
      courseReviews.reduce((sum, review) => sum + review.teachingSkills, 0) /
      reviewCount;
    const totalAttendance =
      courseReviews.reduce((sum, review) => sum + review.attendance, 0) /
      reviewCount;

    return {
      totalRate: parseFloat(totalRate.toFixed(1)),
      reviewCount,
      classLevel: parseFloat(totalClassLevel.toFixed(0)),
      teamProject: parseFloat(totalTeamProject.toFixed(0)),
      amountLearned: parseFloat(totalAmountLearned.toFixed(0)),
      teachingSkills: parseFloat(totalTeachingSkills.toFixed(0)),
      attendance: parseFloat(totalAttendance.toFixed(0)),
      courseName: course.courseName,
    };
  }

  async getMyCourseReviews(
    user: AuthorizedUserDto,
  ): Promise<CourseReviewResponseDto[]> {
    const courseReviews = await this.courseReviewRepository.find({
      where: { userId: user.id },
    });

    return courseReviews.map(
      (courseReview) =>
        new CourseReviewResponseDto(courseReview, user.username),
    );
  }

  async getCourseReviews(
    user: AuthorizedUserDto,
    getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
    courseReviewsFilterDto: CourseReviewsFilterDto,
  ): Promise<GetCourseReviewsResponseDto> {
    // 해당 학수번호-교수명과 일치하는 강의가 존재하는지 체크
    const course = await this.courseService.searchCourseCodeWithProfessorName(
      getCourseReviewsRequestDto.courseCode,
      getCourseReviewsRequestDto.professorName,
    );

    if (!course) {
      throwKukeyException('COURSE_NOT_FOUND');
    }

    const universalTime = new Date();

    // 해당 과목의 강의평들 조회 (유저가 열람권 구매 안했으면 열람 불가 )
    const viewableUser = await this.userService.findUserById(user.id);

    if (viewableUser.viewableUntil <= universalTime) {
      throwKukeyException('COURSE_REVIEW_NOT_VIEWABLE');
    }

    const { criteria, direction } = courseReviewsFilterDto;

    const courseReviews = await this.courseReviewRepository.find({
      where: {
        courseCode: getCourseReviewsRequestDto.courseCode,
        professorName: getCourseReviewsRequestDto.professorName,
      },
      order: { [criteria]: direction },
      relations: ['user'],
      withDeleted: true,
    });

    if (courseReviews.length === 0) {
      return {
        totalRate: 0.0,
        reviewCount: 0,
        reviews: [],
      };
    }

    const reviewCount = courseReviews.length;
    const totalRate =
      courseReviews.reduce((sum, review) => sum + review.rate, 0) / reviewCount;

    const myReviews = await this.courseReviewRecommendRepository.find({
      where: { userId: user.id },
    });

    // 추천한 리뷰 ID들을 배열로 추출
    const recommendedReviewIds = myReviews.map(
      (recommend) => recommend.courseReviewId,
    );

    const reviews = courseReviews.map(
      (courseReview) =>
        new ReviewDto(
          courseReview,
          recommendedReviewIds.includes(courseReview.id),
        ),
    );

    return {
      totalRate: parseFloat(totalRate.toFixed(1)), // 소수점 이하 첫째자리까지 나타내기
      reviewCount,
      reviews,
    };
  }

  async toggleRecommendCourseReview(
    transactionManager: EntityManager,
    user: AuthorizedUserDto,
    courseReviewId: number,
  ): Promise<CourseReviewResponseDto> {
    const courseReview = await transactionManager.findOne(CourseReviewEntity, {
      where: { id: courseReviewId },
      relations: ['user'],
    });

    if (!courseReview) {
      throwKukeyException('COURSE_REVIEW_NOT_FOUND');
    }

    const universalTime = new Date();

    // 해당 과목의 강의평들 조회 (유저가 열람권 구매 안했으면 열람 불가 )
    const viewableUser = await this.userService.findUserById(user.id);
    if (viewableUser.viewableUntil < universalTime) {
      throwKukeyException('COURSE_REVIEW_NOT_VIEWABLE');
    }

    if (courseReview.userId === user.id) {
      throwKukeyException('SELF_REVIEW_RECOMMENDATION_FORBIDDEN');
    }

    // 이미 추천했는지 확인
    const isRecommended = await transactionManager.findOne(
      CourseReviewRecommendEntity,
      {
        where: { userId: user.id, courseReviewId },
      },
    );

    // 이미 추천을 했을 때
    if (isRecommended) {
      await transactionManager.delete(CourseReviewRecommendEntity, {
        userId: user.id,
        courseReviewId,
      });

      await transactionManager.update(CourseReviewEntity, courseReviewId, {
        recommendCount: () => 'recommendCount - 1',
      });
      courseReview.recommendCount -= 1;
    } else {
      await transactionManager.save(CourseReviewRecommendEntity, {
        userId: user.id,
        courseReviewId,
      });
      await transactionManager.update(CourseReviewEntity, courseReviewId, {
        recommendCount: () => 'recommendCount + 1',
      });
      courseReview.recommendCount += 1;
    }
    return new CourseReviewResponseDto(courseReview, user.username);
  }

  async checkCourseReviewSubmission(
    user: AuthorizedUserDto,
    getCourseReviewRequestDto: GetCourseReviewsRequestDto,
  ): Promise<boolean> {
    const courseReview = await this.courseReviewRepository.findOne({
      where: {
        userId: user.id,
        courseCode: getCourseReviewRequestDto.courseCode,
        professorName: getCourseReviewRequestDto.professorName,
      },
    });

    return !!courseReview;
  }
}
