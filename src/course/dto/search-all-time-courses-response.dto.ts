import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonCourseResponseDto } from './common-course-response.dto';
import { PaginatedCoursesDto } from './paginated-courses.dto';

class SearchAllTimeCoursesData extends PickType(CommonCourseResponseDto, [
  'id',
  'professorName',
  'courseName',
  'courseCode',
  'totalRate',
]) {
  @ApiProperty({
    description: '강의평 개수',
  })
  reviewCount: number;
}

export class SearchAllTimeCoursesResponseDto extends PickType(
  PaginatedCoursesDto,
  ['hasNextPage', 'nextCursorId'],
) {
  constructor(courses: SearchAllTimeCoursesData[]) {
    super();
    const hasNextPage = courses.length === 21;
    const nextCursorId = hasNextPage ? courses[19].id : null;

    this.hasNextPage = hasNextPage;
    this.nextCursorId = nextCursorId;
    this.data = hasNextPage ? courses.slice(0, 20) : courses;
  }

  @ApiProperty({
    description: '강의와 관련된 정보',
    type: [SearchAllTimeCoursesData],
  })
  data: SearchAllTimeCoursesData[];
}
