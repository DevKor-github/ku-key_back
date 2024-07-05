import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetCourseReviewsRequestDto {
  @ApiProperty({ description: '교수님 성함' })
  @IsString()
  @IsNotEmpty()
  professorName: string;

  @ApiProperty({ description: '학수번호' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;
}
