import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { LeaveModule } from './leave.module';

describe('LeaveService', () => {
  let service: LeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Add LeaveModule to imports:
      Test.createTestingModule({
        imports: [LeaveModule],
        providers: [LeaveService],
      })
    }).compile();

    service = module.get<LeaveService>(LeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
