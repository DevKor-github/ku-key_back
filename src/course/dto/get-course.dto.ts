import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class GetCourseDto {
  @ApiPropertyOptional({
    description: 'cursor id, 값이 존재하지 않으면 첫 페이지',
  })
  @IsInt()
  @IsOptional()
  cursorId?: number;

  @ApiProperty({ description: '연도' })
  @IsString()
  @Length(4)
  year: string;

  @ApiProperty({ description: '학기' })
  @IsString()
  @Length(1)
  semester: string;

  @ApiProperty({ description: '전공 (과)' })
  @IsString()
  major: string;

  @ApiProperty({ description: '단과 대학' })
  @IsString()
  college: string;
}
