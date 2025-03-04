import { ApiProperty } from '@nestjs/swagger';
import { CourseEntity } from 'src/entities/course.entity';

export class GetCoursesWithCourseReviewsResponseDto {
  @ApiProperty({ description: '강의 ID' })
  id: number;

  @ApiProperty({ description: '교수명' })
  professorName: string;

  @ApiProperty({ description: '강의 이름' })
  courseName: string;

  @ApiProperty({ description: '강의평점' })
  totalRate: number;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '학기' })
  semester: string;

  constructor(course: CourseEntity) {
    this.id = course.id;
    this.professorName = course.professorName;
    this.courseName = course.courseName;
    this.totalRate = course.totalRate;
    this.year = course.year;
    this.semester = course.semester;
  }
}
