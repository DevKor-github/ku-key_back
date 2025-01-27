import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { CourseDetailRepository } from './course-detail.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { AcademicFoundationSearchStrategy } from './strategy/academic-foundation-search-strategy';
import { GeneralSearchStrategy } from './strategy/general-search-strategy';
import { MajorSearchStrategy } from './strategy/major-search-strategy';
import { AllCoursesSearchStrategy } from './strategy/all-courses-search-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, CourseDetailEntity])],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseRepository,
    CourseDetailRepository,
    AcademicFoundationSearchStrategy,
    GeneralSearchStrategy,
    MajorSearchStrategy,
    AllCoursesSearchStrategy,
    {
      provide: 'CourseSearchStrategy',
      useFactory: (
        academicFoundationSearchStrategy: AcademicFoundationSearchStrategy,
        generalSearchStrategy: GeneralSearchStrategy,
        majorSearchStrategy: MajorSearchStrategy,
        allCoursesSearchStrategy: AllCoursesSearchStrategy,
      ) => [
        academicFoundationSearchStrategy,
        generalSearchStrategy,
        majorSearchStrategy,
        allCoursesSearchStrategy,
      ],
      inject: [
        AcademicFoundationSearchStrategy,
        GeneralSearchStrategy,
        MajorSearchStrategy,
        AllCoursesSearchStrategy,
      ],
    },
  ],
  exports: [CourseService],
})
export class CourseModule {}
