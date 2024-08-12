import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceCheckController } from './attendance-check.controller';

describe('AttendanceCheckController', () => {
  let controller: AttendanceCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceCheckController],
    }).compile();

    controller = module.get<AttendanceCheckController>(AttendanceCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
