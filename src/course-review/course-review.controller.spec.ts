import { Test, TestingModule } from '@nestjs/testing';
import { CourseReviewController } from './course-review.controller';

describe('CourseReviewController', () => {
  let controller: CourseReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseReviewController],
    }).compile();

    controller = module.get<CourseReviewController>(CourseReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
