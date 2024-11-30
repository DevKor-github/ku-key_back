import { ApiProperty } from '@nestjs/swagger';
import { CommonCourseResponseDto } from './common-course-response.dto';

export class PaginatedCoursesDto {
  static readonly LIMIT = 21;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ description: '다음 cursor id' })
  nextCursorId: number;

  @ApiProperty({ description: '강의 리스트', type: [CommonCourseResponseDto] })
  data: CommonCourseResponseDto[];

  constructor(commonCourseResponseDto: CommonCourseResponseDto[]) {
    const hasNextPage = commonCourseResponseDto.length === 21;
    const nextCursorId = hasNextPage ? commonCourseResponseDto[19].id : null;

    this.hasNextPage = hasNextPage;
    this.nextCursorId = nextCursorId;
    this.data = hasNextPage
      ? commonCourseResponseDto.slice(0, 20)
      : commonCourseResponseDto;
  }
}
