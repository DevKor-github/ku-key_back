import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { CourseDetailRepository } from './course-detail.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from 'src/entities/course.entity';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { AcademicFoundationSearchStrategy } from './strategy/academic-foundation-search-strategy';
import { AllCoursesSearchStrategy } from './strategy/all-courses-search-strategy';
import { GeneralSearchStrategy } from './strategy/general-search-strategy';
import { MajorSearchStrategy } from './strategy/major-search-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, CourseDetailEntity])],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseRepository,
    CourseDetailRepository,
    AcademicFoundationSearchStrategy,
    AllCoursesSearchStrategy,
    GeneralSearchStrategy,
    MajorSearchStrategy,
    {
      provide: 'CourseSearchStrategy',
      useFactory: (
        academicFoundationSearchStrategy: AcademicFoundationSearchStrategy,
        allCoursesSearchStrategy: AllCoursesSearchStrategy,
        generalSearchStrategy: GeneralSearchStrategy,
        majorSearchStrategy: MajorSearchStrategy,
      ) => [
        academicFoundationSearchStrategy,
        allCoursesSearchStrategy,
        generalSearchStrategy,
        majorSearchStrategy,
      ],
      inject: [
        AcademicFoundationSearchStrategy,
        AllCoursesSearchStrategy,
        GeneralSearchStrategy,
        MajorSearchStrategy,
      ],
    },
  ],
  exports: [CourseService],
})
export class CourseModule {}
