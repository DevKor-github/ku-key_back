import { ApiProperty } from '@nestjs/swagger';
import { CommonCourseResponseDto } from './common-course-response.dto';

export class PaginatedCoursesDto {
  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ description: '다음 cursor id' })
  nextCursorId: number;

  @ApiProperty({ description: '강의 리스트', type: [CommonCourseResponseDto] })
  data: CommonCourseResponseDto[];

  constructor(commonCourseResponseDto: CommonCourseResponseDto[]) {
    const hasNextPage = commonCourseResponseDto.length === 5;
    const nextCursorId = hasNextPage
      ? commonCourseResponseDto[3].id
      : null;

    this.hasNextPage = hasNextPage;
    this.nextCursorId = nextCursorId;
    this.data = hasNextPage
      ? commonCourseResponseDto.slice(0, 4)
      : commonCourseResponseDto;
  }
}
