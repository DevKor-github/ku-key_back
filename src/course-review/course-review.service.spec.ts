import { Test, TestingModule } from '@nestjs/testing';
import { CourseReviewService } from './course-review.service';

describe('CourseReviewService', () => {
  let service: CourseReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseReviewService],
    }).compile();

    service = module.get<CourseReviewService>(CourseReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
