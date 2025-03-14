import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TimetableDto {
  @ApiProperty({ description: '학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '연도' })
  @IsString()
  @IsNotEmpty()
  year: string;
}
