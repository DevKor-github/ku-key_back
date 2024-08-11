import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceCheckService } from './attendance-check.service';

describe('AttendanceCheckService', () => {
  let service: AttendanceCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceCheckService],
    }).compile();

    service = module.get<AttendanceCheckService>(AttendanceCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
