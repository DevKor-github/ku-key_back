import { ApiProperty } from '@nestjs/swagger';
import { CourseEntity } from 'src/entities/course.entity';

export class CommonCourseResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '교수 이름' })
  professorName: string;

  @ApiProperty({ description: '강의 구분' })
  category: string;

  @ApiProperty({ description: '단과대 이름' })
  college?: string;

  @ApiProperty({ description: '강의명' })
  courseName: string;

  @ApiProperty({ description: '학수 번호' })
  courseCode: string;

  @ApiProperty({ description: '학점' })
  credit: number;

  @ApiProperty({ description: '학과 이름' })
  major?: string;

  @ApiProperty({ description: '교환학생 수강 가능 여부' })
  hasExchangeSeat: boolean;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '학기' })
  semester: string;

  @ApiProperty({ description: '강의계획서 url' })
  syllabus: string;

  @ApiProperty({ description: '강의평점' })
  totalRate: number;

  constructor(course: CourseEntity) {
    this.id = course.id;
    this.professorName = course.professorName;
    this.category = course.category;
    this.college = course.college;
    this.courseName = course.courseName;
    this.courseCode = course.courseCode;
    this.credit = course.credit;
    this.major = course.major;
    this.hasExchangeSeat = course.hasExchangeSeat;
    this.year = course.year;
    this.semester = course.semester;
    this.syllabus = course.syllabus;
    this.totalRate = course.totalRate;
  }
}
