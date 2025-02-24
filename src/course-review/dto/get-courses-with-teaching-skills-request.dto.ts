import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class GetCoursesWithTeachingSkillsRequestDto {
  @ApiProperty({ description: '반환 개수' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  limit: number;
}
