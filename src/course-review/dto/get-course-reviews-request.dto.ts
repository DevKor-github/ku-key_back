import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GetCourseReviewsRequestDto {
  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @IsNotEmpty()
  @Length(3)
  professorName: string;

  @ApiProperty({ description: '학수번호' })
  @IsString()
  @IsNotEmpty()
  @Length(7, 7)
  courseCode: string;
}
