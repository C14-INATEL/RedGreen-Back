import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SlotSessionService } from '../src/modules/slot-machine/sessions/application/slot-session.service';
import {
  SlotSession,
  SlotSessionStatus,
} from '../src/modules/slot-machine/sessions/domain/slot-session.entity';
import { SlotSymbol } from '../src/modules/slot-machine/sessions/domain/enums/slot-symbol.enum';
import type { SpinReelResult } from '../src/modules/slot-machine/sessions/domain/types/slot-session.types';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { SlotMachineService } from '../src/modules/slot-machine/application/slot-machine.service';
import { SlotMachine } from '../src/modules/slot-machine/domain/slot-machine.entity';
import { SlotMachineColor } from '../src/modules/slot-machine/domain/enums/slot-machine-color.enum';
import { CreateSlotSessionDto } from '../src/modules/slot-machine/sessions/domain/dto/create-slot-session.dto';
import { BadRequestException } from '@nestjs/common';

type SlotSessionRepoMock = {
  create: jest.MockedFunction<(session: Partial<SlotSession>) => SlotSession>;
  save: jest.MockedFunction<(session: SlotSession) => Promise<SlotSession>>;
  findOne: jest.MockedFunction<
    (criteria: object) => Promise<SlotSession | null>
  >;
  find: jest.MockedFunction<(criteria: object) => Promise<SlotSession[]>>;
};

type AuthServiceMock = {
  GetChipBalance: jest.MockedFunction<
    (userId: string) => Promise<{ ChipBalance: number }>
  >;
  UpdateChipBalance: jest.MockedFunction<
    (userId: string, amount: number) => Promise<void>
  >;
};

type SlotMachineServiceMock = {
  FindOne: jest.MockedFunction<(id: number) => Promise<SlotMachine>>;
};

type SlotSessionServicePrivate = {
  calculateReward(reels: SpinReelResult[]): number;
  generateRandomReels(): SpinReelResult[];
};

type CashOutTransactionalRepoMock = {
  findOne: jest.MockedFunction<
    (Criteria: object) => Promise<SlotSession | null>
  >;
  save: jest.MockedFunction<(Session: SlotSession) => Promise<SlotSession>>;
};

type QueryRunnerMock = {
  connect: jest.MockedFunction<() => Promise<void>>;
  startTransaction: jest.MockedFunction<() => Promise<void>>;
  commitTransaction: jest.MockedFunction<() => Promise<void>>;
  rollbackTransaction: jest.MockedFunction<() => Promise<void>>;
  release: jest.MockedFunction<() => Promise<void>>;
  manager: {
    getRepository: jest.MockedFunction<() => CashOutTransactionalRepoMock>;
  };
};

type DataSourceMock = {
  createQueryRunner: jest.MockedFunction<() => QueryRunnerMock>;
};

const MockCashOutRepo: CashOutTransactionalRepoMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const MockQueryRunner: QueryRunnerMock = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    getRepository: jest.fn().mockReturnValue(MockCashOutRepo),
  },
};

const MockDataSource: DataSourceMock = {
  createQueryRunner: jest.fn().mockReturnValue(MockQueryRunner),
};

const CallCalculateReward = (
  Service: SlotSessionService,
  Reels: SpinReelResult[]
): number => {
  return (Service as unknown as SlotSessionServicePrivate).calculateReward(
    Reels
  );
};

const CallGenerateRandomReels = (
  Service: SlotSessionService
): SpinReelResult[] => {
  return (
    Service as unknown as SlotSessionServicePrivate
  ).generateRandomReels();
};

describe('SlotSessionService', () => {
  let Service: SlotSessionService;
  let SlotSessionRepo: SlotSessionRepoMock;
  let AuthServiceMockInstance: AuthServiceMock;

  const MockSlotSessionRepo: SlotSessionRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const MockAuthService: AuthServiceMock = {
    GetChipBalance: jest.fn(),
    UpdateChipBalance: jest.fn(),
  };

  const MockSlotMachineService: SlotMachineServiceMock = {
    FindOne: jest.fn(),
  };

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotSessionService,
        {
          provide: getRepositoryToken(SlotSession),
          useValue: MockSlotSessionRepo as unknown as Repository<SlotSession>,
        },
        {
          provide: DataSource,
          useValue: MockDataSource as unknown as DataSource,
        },
        {
          provide: AuthService,
          useValue: MockAuthService as unknown as AuthService,
        },
        {
          provide: SlotMachineService,
          useValue: MockSlotMachineService as unknown as SlotMachineService,
        },
      ],
    }).compile();

    Service = Module.get<SlotSessionService>(SlotSessionService);
    SlotSessionRepo = MockSlotSessionRepo;
    AuthServiceMockInstance = MockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateReward', () => {
    it('should return 0 when rat is present without cheese', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(0);
    });

    it('should return 5 for 3 oranges', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(5);
    });

    it('should return 8 for 4 oranges', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(8);
    });

    it('should return 10 for 3 oranges', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });

    it('should return 15 for 4 oranges', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 3, SymbolId: SlotSymbol.Oranges },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(15);
    });

    it('should return 20 for 1 pig', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(20);
    });

    it('should return 100 for 4 watermelons', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 1, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 2, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 3, SymbolId: SlotSymbol.Watermelon },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(100);
    });

    it('should double reward with TwoX', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });

    it('should cancel rat effect with cheese', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });

    it('should give bonus when cheese and rat are present', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });

    it('should apply TwoX multiplier after rat + cheese bonus', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.TwoX },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(20);
    });

    it('should handle multiple rats with cheese and multiplier', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(40);
    });

    it('should include egg symbol', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Egg },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Egg },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(0);
    });

    it('should combine pig rewards with multiplier', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 1, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 2, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(120);
    });

    it('should not reward rat when present alone or with other non-cheese symbols', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 2, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 3, SymbolId: SlotSymbol.Rat },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(0);
    });

    it('should combine orange and pig rewards', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Pig },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(25);
    });

    it('should double combined rewards (oranges + pig + multiplier)', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });

    it('should handle oranges combined with pigs and multiplier', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(40);
    });

    it('should handle all oranges with multiplier', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(20);
    });

    it('should zero reward when rat blocks everything with multiplier', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(0);
    });

    it('should handle multiple cheese symbols with rats', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(20);
    });

    it('should handle no matching symbols', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Egg },
        { ReelIndex: 1, SymbolId: SlotSymbol.Egg },
        { ReelIndex: 2, SymbolId: SlotSymbol.Egg },
        { ReelIndex: 3, SymbolId: SlotSymbol.Egg },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(0);
    });

    it('should apply rat + cheese bonus correctly', () => {
      const Reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const Result = CallCalculateReward(Service, Reels);
      expect(Result).toBe(10);
    });
  });

  describe('generateRandomReels', () => {
    it('should generate 4 reels', () => {
      const Result = CallGenerateRandomReels(Service);
      expect(Result).toHaveLength(4);
      expect(Result[0]).toHaveProperty('ReelIndex', 0);
      expect(Result[1]).toHaveProperty('ReelIndex', 1);
      expect(Result[2]).toHaveProperty('ReelIndex', 2);
      expect(Result[3]).toHaveProperty('ReelIndex', 3);
    });

    it('should have valid symbol IDs', () => {
      const Result = CallGenerateRandomReels(Service);
      const Symbols = Object.values(SlotSymbol);

      Result.forEach((Reel) => {
        expect(Symbols).toContain(Reel.SymbolId);
      });
    });

    it('should include all valid symbols in possible outcomes', () => {
      const Symbols = Object.values(SlotSymbol);
      expect(Symbols).toContain(SlotSymbol.Egg);
      expect(Symbols).toContain(SlotSymbol.Orange);
      expect(Symbols).toContain(SlotSymbol.Oranges);
      expect(Symbols).toContain(SlotSymbol.Watermelon);
      expect(Symbols).toContain(SlotSymbol.Rat);
      expect(Symbols).toContain(SlotSymbol.Cheese);
      expect(Symbols).toContain(SlotSymbol.TwoX);
      expect(Symbols).toContain(SlotSymbol.Pig);
      expect(Symbols.length).toBe(8);
    });

    it('should generate reels with different indices', () => {
      const Result = CallGenerateRandomReels(Service);
      const Indices = Result.map((Reel) => Reel.ReelIndex);
      expect(Indices).toEqual([0, 1, 2, 3]);
    });

    it('should select symbols according to configured probability', () => {
      // Orange: 0.00 - 0.25
      // Oranges: 0.25 - 0.45
      // Pig: 0.45 - 0.50
      // TwoX: 0.50 - 0.55
      // Rat: 0.55 - 0.70
      // Cheese: 0.70 - 0.80
      // Watermelon: 0.80 - 0.90
      // Egg: 0.90 - 1.00

      const OriginalRandom = Math.random;
      try {
        const Values = [0.0, 0.3, 0.46, 0.52, 0.6, 0.75, 0.85, 0.95];
        const Expected = [
          SlotSymbol.Orange,
          SlotSymbol.Oranges,
          SlotSymbol.Pig,
          SlotSymbol.TwoX,
          SlotSymbol.Rat,
          SlotSymbol.Cheese,
          SlotSymbol.Watermelon,
          SlotSymbol.Egg,
        ];

        Values.forEach((V, I) => {
          jest.spyOn(Math, 'random').mockReturnValueOnce(V);
          const SelectedSymbol = (
            Service as unknown as SlotSessionServicePrivate
          ).generateRandomReels()[0].SymbolId;
          expect(SelectedSymbol).toBe(Expected[I]);
        });
      } finally {
        Math.random = OriginalRandom;
        jest.restoreAllMocks();
      }
    });
  });

  describe('create', () => {
    const MockSlotMachine: SlotMachine = {
      SlotMachineId: 1,
      Name: 'Test Machine',
      Description: 'Test machine',
      MinimumSpinValue: 10,
      MinimumChipsRequired: 0,
      MinimumRerollValue: 5,
      Active: true,
      TableColor: SlotMachineColor.White,
    };

    const MockUserBalance = { ChipBalance: 100 };
    const SavedSession = {
      SlotSessionId: 1,
      UserId: 'user1',
      SlotMachineId: 1,
      Status: SlotSessionStatus.InProgress,
      StartedAt: new Date(),
      LastInteractionAt: new Date(),
      EndedAt: null,
      CurrentRewardSnapshot: 0,
      CurrentSpinResult: { Reels: [] },
      CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 0 } },
      DeletedAt: null,
    } as unknown as SlotSession;

    it('should create session successfully', async () => {
      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      MockSlotSessionRepo.findOne.mockResolvedValue(null);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue(MockUserBalance);
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      SlotSessionRepo.create.mockReturnValue(SavedSession);
      SlotSessionRepo.save.mockResolvedValue(SavedSession);

      const Dto = new CreateSlotSessionDto();
      const Result = await Service.create(1, Dto, 'user1');

      expect(Result).toHaveProperty('session');
      expect(Result).toHaveProperty('currentBalance');
      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        'user1',
        -10
      );
    });

    it('should throw error when user has active session with chips', async () => {
      const ActiveSessionWithChips = {
        SlotSessionId: 2,
        UserId: 'user1',
        SlotMachineId: 1,
        Status: SlotSessionStatus.InProgress,
        CurrentRewardSnapshot: 5,
      } as unknown as SlotSession;

      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(ActiveSessionWithChips);

      const Dto = new CreateSlotSessionDto();

      try {
        await Service.create(1, Dto, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe(
          'Cannot start new session while having chips in any machine. Please cash out first.'
        );
      }
    });

    it('should throw error when insufficient chips', async () => {
      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(null);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 5,
      });

      const Dto = new CreateSlotSessionDto();

      try {
        await Service.create(1, Dto, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('Insufficient chips to start a new session');
      }
    });
  });

  describe('reroll', () => {
    const MockSlotMachine: SlotMachine = {
      SlotMachineId: 1,
      Name: 'Test Machine',
      Description: 'Test machine',
      MinimumSpinValue: 10,
      MinimumChipsRequired: 0,
      MinimumRerollValue: 5,
      Active: true,
      TableColor: SlotMachineColor.White,
    };

    const MockSession = {
      SlotSessionId: 1,
      UserId: 'user1',
      SlotMachineId: 1,
      Status: SlotSessionStatus.InProgress,
      StartedAt: new Date(),
      LastInteractionAt: new Date(),
      EndedAt: null,
      CurrentRewardSnapshot: 0,
      CurrentSpinResult: {
        Reels: [
          { ReelIndex: 0, SymbolId: SlotSymbol.Cheese },
          { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
          { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
          { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
        ],
      },
      CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 0 } },
      DeletedAt: null,
    } as unknown as SlotSession;

    it('should reroll successfully', async () => {
      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(MockSession);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 100,
      });
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      SlotSessionRepo.save.mockResolvedValue(MockSession);

      const Result = await Service.reroll(1, 1, 0, 'user1');

      expect(Result).toHaveProperty('session');
      expect(Result).toHaveProperty('currentBalance');
      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        'user1',
        -5
      );
    });

    it('should throw error when no rerolls left', async () => {
      const SessionWithoutRerolls = {
        ...MockSession,
        CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 5 } },
      } as unknown as SlotSession;

      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(SessionWithoutRerolls);

      try {
        await Service.reroll(1, 1, 0, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('No rerolls left');
      }
    });

    it('should throw error when session is not active', async () => {
      const InactiveSession = {
        ...MockSession,
        Status: SlotSessionStatus.Finished,
      } as unknown as SlotSession;

      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(InactiveSession);

      try {
        await Service.reroll(1, 1, 0, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('Session is not active');
      }
    });

    it('should increment rerolls used counter', async () => {
      const SessionWithRerolls = {
        ...MockSession,
        CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 2 } },
      } as unknown as SlotSession;

      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(SessionWithRerolls);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 100,
      });
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);

      const UpdatedSession = {
        ...SessionWithRerolls,
        CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 3 } },
      } as unknown as SlotSession;

      SlotSessionRepo.save.mockResolvedValue(UpdatedSession);

      const Result = await Service.reroll(1, 1, 0, 'user1');

      const SavedSession = SlotSessionRepo.save.mock.calls[0][0];
      expect(SavedSession.CurrentRerollsSpent.Rerolls.Used).toBe(3);
      expect(Result).toHaveProperty('session');
    });

    it('should throw error when insufficient chips for reroll', async () => {
      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(MockSession);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 2,
      });

      try {
        await Service.reroll(1, 1, 0, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('Insufficient chips to reroll');
      }
    });

    it('should update reward after reroll', async () => {
      const SessionBeforeReroll = {
        ...MockSession,
        CurrentRewardSnapshot: 10,
      } as unknown as SlotSession;

      MockSlotMachineService.FindOne.mockResolvedValue(MockSlotMachine);
      SlotSessionRepo.findOne.mockResolvedValue(SessionBeforeReroll);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 100,
      });
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);

      const SessionAfterReroll = {
        ...SessionBeforeReroll,
        CurrentRewardSnapshot: 25,
      } as unknown as SlotSession;

      SlotSessionRepo.save.mockResolvedValue(SessionAfterReroll);

      const Result = await Service.reroll(1, 1, 0, 'user1');

      expect(Result).toHaveProperty('session');
      expect(SlotSessionRepo.save).toHaveBeenCalled();
    });
  });

  describe('cashOut', () => {
    const SlotMachineId = 1;
    const SessionId = 10;
    const UserId = 'user1';

    const BuildActiveSession = (
      Overrides: Partial<SlotSession> = {}
    ): SlotSession =>
      ({
        SlotSessionId: SessionId,
        SlotMachineId: SlotMachineId,
        UserId: UserId,
        Status: SlotSessionStatus.InProgress,
        CurrentRewardSnapshot: 42,
        StartedAt: new Date(),
        LastInteractionAt: new Date(),
        EndedAt: null,
        CurrentSpinResult: { Reels: [] },
        CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 0 } },
        DeletedAt: null,
        ...Overrides,
      }) as unknown as SlotSession;

    it('should credit reward, end session, and commit transaction', async () => {
      const ActiveSession = BuildActiveSession({ CurrentRewardSnapshot: 42 });
      MockCashOutRepo.findOne.mockResolvedValue(ActiveSession);
      MockCashOutRepo.save.mockImplementation((Session) =>
        Promise.resolve(Session)
      );
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 142,
      });

      const Result = await Service.cashOut(SlotMachineId, SessionId, UserId);

      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        UserId,
        42
      );

      const SavedSession = MockCashOutRepo.save.mock.calls[0][0];
      expect(SavedSession.SlotSessionId).toBe(SessionId);
      expect(SavedSession.Status).toBe(SlotSessionStatus.CashedOut);
      expect(SavedSession.EndedAt).toBeInstanceOf(Date);
      expect(MockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(MockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(MockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(Result).toEqual({
        message: 'Cash out successful',
        finalBalance: 142,
      });
    });

    it('should rollback transaction when session is not active', async () => {
      const EndedSession = BuildActiveSession({
        Status: SlotSessionStatus.CashedOut,
      });
      MockCashOutRepo.findOne.mockResolvedValue(EndedSession);

      await expect(
        Service.cashOut(SlotMachineId, SessionId, UserId)
      ).rejects.toThrow(BadRequestException);

      expect(AuthServiceMockInstance.UpdateChipBalance).not.toHaveBeenCalled();
      expect(MockCashOutRepo.save).not.toHaveBeenCalled();
      expect(MockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(MockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(MockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction when crediting chips fails', async () => {
      const ActiveSession = BuildActiveSession({ CurrentRewardSnapshot: 42 });
      const CreditError = new Error('Chip service unavailable');
      MockCashOutRepo.findOne.mockResolvedValue(ActiveSession);
      AuthServiceMockInstance.UpdateChipBalance.mockRejectedValue(CreditError);

      await expect(
        Service.cashOut(SlotMachineId, SessionId, UserId)
      ).rejects.toThrow(CreditError);

      expect(MockCashOutRepo.save).not.toHaveBeenCalled();
      expect(MockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(MockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(MockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should credit correct reward from Rat + Cheese + 2x combination', async () => {
      const ActiveSession = BuildActiveSession({ CurrentRewardSnapshot: 20 });
      MockCashOutRepo.findOne.mockResolvedValue(ActiveSession);
      MockCashOutRepo.save.mockImplementation((Session) =>
        Promise.resolve(Session)
      );
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 170,
      });

      const Result = await Service.cashOut(SlotMachineId, SessionId, UserId);

      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        UserId,
        20
      );
      expect(Result.finalBalance).toBe(170);
      expect(MockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle jackpot watermelon reward', async () => {
      const ActiveSession = BuildActiveSession({ CurrentRewardSnapshot: 100 });
      MockCashOutRepo.findOne.mockResolvedValue(ActiveSession);
      MockCashOutRepo.save.mockImplementation((Session) =>
        Promise.resolve(Session)
      );
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 200,
      });

      const Result = await Service.cashOut(SlotMachineId, SessionId, UserId);

      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        UserId,
        100
      );
      expect(Result.finalBalance).toBe(200);
      expect(MockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle complex combined rewards', async () => {
      const ActiveSession = BuildActiveSession({ CurrentRewardSnapshot: 90 });
      MockCashOutRepo.findOne.mockResolvedValue(ActiveSession);
      MockCashOutRepo.save.mockImplementation((Session) =>
        Promise.resolve(Session)
      );
      AuthServiceMockInstance.UpdateChipBalance.mockResolvedValue(undefined);
      AuthServiceMockInstance.GetChipBalance.mockResolvedValue({
        ChipBalance: 190,
      });

      const Result = await Service.cashOut(SlotMachineId, SessionId, UserId);

      expect(AuthServiceMockInstance.UpdateChipBalance).toHaveBeenCalledWith(
        UserId,
        90
      );
      expect(Result.finalBalance).toBe(190);
      expect(MockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should not save session when session not found', async () => {
      MockCashOutRepo.findOne.mockResolvedValue(null);

      await expect(
        Service.cashOut(SlotMachineId, SessionId, UserId)
      ).rejects.toThrow();

      expect(MockCashOutRepo.save).not.toHaveBeenCalled();
      expect(MockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
