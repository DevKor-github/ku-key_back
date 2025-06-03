import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommonCourseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getCourseReviewCount(
    coursePairs: {
      courseCode: string;
      professorName: string;
    }[],
  ): Promise<Map<string, number>> {
    if (coursePairs.length === 0) {
      return new Map();
    }

    const placeholders = coursePairs.map(() => '(?, ?)').join(',');

    const params = coursePairs.flatMap((pair) => [
      pair.courseCode,
      pair.professorName,
    ]);

    const query = `
       SELECT courseCode as "courseCode", professorName as "professorName", COUNT(*) as reviewCount
       FROM course_review
       WHERE (courseCode, professorName) IN (${placeholders})
       GROUP BY courseCode, professorName
     `;

    const reviewCounts = await this.dataSource.query(query, params);

    const reviewCountMap = new Map<string, number>();
    reviewCounts.forEach((item) => {
      const key = `${item.courseCode}-${item.professorName}`;
      reviewCountMap.set(key, parseInt(item.reviewCount));
    });

    return reviewCountMap;
  }
}
