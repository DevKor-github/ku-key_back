import { Module } from '@nestjs/common';
import { CourseReviewController } from './course-review.controller';
import { CourseReviewService } from './course-review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/course/course.module';
import { CourseReviewRecommendEntity } from 'src/entities/course-review-recommend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseReviewEntity, CourseReviewRecommendEntity]),
    AuthModule,
    UserModule,
    CourseModule,
  ],
  controllers: [CourseReviewController],
  providers: [CourseReviewService],
})
export class CourseReviewModule {}
