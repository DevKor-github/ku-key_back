import { ApiProperty } from '@nestjs/swagger';
import { CourseEntity } from 'src/entities/course.entity';

export class GetCoursesWithTeachingSkillsResponseDto {
  @ApiProperty({ description: '강의 ID' })
  id: number;

  @ApiProperty({ description: '교수명' })
  professorName: string;

  @ApiProperty({ description: '강의 이름' })
  courseName: string;

  @ApiProperty({ description: '교수님 강의력' })
  teachingSkills: number;

  @ApiProperty({ description: '연도' })
  year: string;

  @ApiProperty({ description: '학기' })
  semester: string;

  constructor({
    id,
    professorName,
    courseName,
    teachingSkills,
    year,
    semester,
  }: {
    id: number;
    professorName: string;
    courseName: string;
    teachingSkills: number;
    year: string;
    semester: string;
  }) {
    this.id = id;
    this.professorName = professorName;
    this.courseName = courseName;
    this.teachingSkills = teachingSkills;
    this.year = year;
    this.semester = semester;
  }
}
