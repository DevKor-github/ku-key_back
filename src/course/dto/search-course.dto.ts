import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SearchCourseDto {
  @ApiProperty({ description: '학수 번호' })
  @IsString()
  @Length(7)
  courseCode: string;

  @ApiProperty({ description: '강의명' })
  @IsString()
  @Length(2)
  courseName: string;

  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @Length(3)
  professorName: string;
}
