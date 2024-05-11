import { IsOptional, IsString, Length } from 'class-validator';

export class SearchCourseDto {
  @IsString()
  @Length(2)
  @IsOptional()
  courseCode?: string;

  @IsString()
  @Length(2)
  @IsOptional()
  courseName?: string;

  @IsString()
  @Length(3)
  @IsOptional()
  professorName?: string;
}
