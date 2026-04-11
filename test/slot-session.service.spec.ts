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
import { CreateSlotSessionDto } from '../src/modules/slot-machine/sessions/domain/dto/create-slot-session.dto';

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

const callCalculateReward = (
  service: SlotSessionService,
  reels: SpinReelResult[]
): number => {
  return (service as unknown as SlotSessionServicePrivate).calculateReward(
    reels
  );
};

const callGenerateRandomReels = (
  service: SlotSessionService
): SpinReelResult[] => {
  return (
    service as unknown as SlotSessionServicePrivate
  ).generateRandomReels();
};

describe('SlotSessionService', () => {
  let service: SlotSessionService;
  let slotSessionRepo: SlotSessionRepoMock;
  let authService: AuthServiceMock;

  const mockSlotSessionRepo: SlotSessionRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAuthService: AuthServiceMock = {
    GetChipBalance: jest.fn(),
    UpdateChipBalance: jest.fn(),
  };

  const mockSlotMachineService: SlotMachineServiceMock = {
    FindOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotSessionService,
        {
          provide: getRepositoryToken(SlotSession),
          useValue: mockSlotSessionRepo as unknown as Repository<SlotSession>,
        },
        {
          provide: AuthService,
          useValue: mockAuthService as unknown as AuthService,
        },
        {
          provide: SlotMachineService,
          useValue: mockSlotMachineService as unknown as SlotMachineService,
        },
        {
          provide: DataSource,
          useValue: {} as DataSource,
        },
      ],
    }).compile();

    service = module.get<SlotSessionService>(SlotSessionService);
    slotSessionRepo = mockSlotSessionRepo;
    authService = mockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateReward', () => {
    it('should return 0 when rat is present without cheese', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(0);
    });

    it('should return 3 for 3 oranges', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(3);
    });

    it('should return 5 for 4 oranges', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(5);
    });

    it('should return 9 for 3 oranges (stack)', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(9);
    });

    it('should return 15 for 4 oranges (stack)', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 1, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 2, SymbolId: SlotSymbol.Oranges },
        { ReelIndex: 3, SymbolId: SlotSymbol.Oranges },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(15);
    });

    it('should return 10 for 1 pig', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Pig },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(10);
    });

    it('should return 100 for 4 watermelons', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 1, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 2, SymbolId: SlotSymbol.Watermelon },
        { ReelIndex: 3, SymbolId: SlotSymbol.Watermelon },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(100);
    });

    it('should double reward with TwoX', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 1, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.TwoX },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(6);
    });

    it('should cancel rat effect with cheese', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Orange },
        { ReelIndex: 3, SymbolId: SlotSymbol.Orange },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(3);
    });

    it('should give bonus when cheese and rat are present', () => {
      const reels: SpinReelResult[] = [
        { ReelIndex: 0, SymbolId: SlotSymbol.Rat },
        { ReelIndex: 1, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 2, SymbolId: SlotSymbol.Cheese },
        { ReelIndex: 3, SymbolId: SlotSymbol.Cheese },
      ];

      const result = callCalculateReward(service, reels);
      expect(result).toBe(3);
    });
  });

  describe('generateRandomReels', () => {
    it('should generate 4 reels', () => {
      const result = callGenerateRandomReels(service);
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('ReelIndex', 0);
      expect(result[1]).toHaveProperty('ReelIndex', 1);
      expect(result[2]).toHaveProperty('ReelIndex', 2);
      expect(result[3]).toHaveProperty('ReelIndex', 3);
    });

    it('should have valid symbol IDs', () => {
      const result = callGenerateRandomReels(service);
      const symbols = Object.values(SlotSymbol);

      result.forEach((reel) => {
        expect(symbols).toContain(reel.SymbolId);
      });
    });
  });

  describe('create', () => {
    const mockSlotMachine: SlotMachine = {
      SlotMachineId: 1,
      Name: 'Test Machine',
      Description: 'Test machine',
      MinimumSpinValue: 10,
      MinimumChipsRequired: 0,
      MinimumRerollValue: 5,
      MaxRerolls: 5,
      Active: true,
    };

    const mockUserBalance = { ChipBalance: 100 };
    const savedSession = {
      SlotSessionId: 1,
      UserId: 'user1',
      SlotMachineId: 1,
      Status: SlotSessionStatus.Active,
      StartedAt: new Date(),
      LastInteractionAt: new Date(),
      EndedAt: null,
      CurrentRewardSnapshot: 0,
      CurrentSpinResult: { Reels: [] },
      CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 0 } },
      DeletedAt: null,
    } as unknown as SlotSession;

    it('should create session successfully', async () => {
      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      mockSlotSessionRepo.findOne.mockResolvedValue(null);
      authService.GetChipBalance.mockResolvedValue(mockUserBalance);
      authService.UpdateChipBalance.mockResolvedValue(undefined);
      slotSessionRepo.create.mockReturnValue(savedSession);
      slotSessionRepo.save.mockResolvedValue(savedSession);

      const dto = new CreateSlotSessionDto();
      const result = await service.create(1, dto, 'user1');

      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('currentBalance');
      expect(authService.UpdateChipBalance).toHaveBeenCalledWith('user1', -10);
    });

    it('should throw error when user has active session with chips', async () => {
      const activeSessionWithChips = {
        SlotSessionId: 2,
        UserId: 'user1',
        SlotMachineId: 1,
        Status: SlotSessionStatus.Active,
        CurrentRewardSnapshot: 5,
      } as unknown as SlotSession;

      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      slotSessionRepo.findOne.mockResolvedValue(activeSessionWithChips);

      const dto = new CreateSlotSessionDto();

      try {
        await service.create(1, dto, 'user1');
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
      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      slotSessionRepo.findOne.mockResolvedValue(null);
      authService.GetChipBalance.mockResolvedValue({ ChipBalance: 5 });

      const dto = new CreateSlotSessionDto();

      try {
        await service.create(1, dto, 'user1');
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
    const mockSlotMachine: SlotMachine = {
      SlotMachineId: 1,
      Name: 'Test Machine',
      Description: 'Test machine',
      MinimumSpinValue: 10,
      MinimumChipsRequired: 0,
      MinimumRerollValue: 5,
      MaxRerolls: 5,
      Active: true,
    };

    const mockSession = {
      SlotSessionId: 1,
      UserId: 'user1',
      SlotMachineId: 1,
      Status: SlotSessionStatus.Active,
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
      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      slotSessionRepo.findOne.mockResolvedValue(mockSession);
      authService.GetChipBalance.mockResolvedValue({ ChipBalance: 100 });
      authService.UpdateChipBalance.mockResolvedValue(undefined);
      slotSessionRepo.save.mockResolvedValue(mockSession);

      const result = await service.reroll(1, 1, 0, 'user1');

      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('currentBalance');
      expect(authService.UpdateChipBalance).toHaveBeenCalledWith('user1', -5);
    });

    it('should throw error when no rerolls left', async () => {
      const sessionWithoutRerolls = {
        ...mockSession,
        CurrentRerollsSpent: { Rerolls: { Max: 5, Used: 5 } },
      } as unknown as SlotSession;

      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      slotSessionRepo.findOne.mockResolvedValue(sessionWithoutRerolls);

      try {
        await service.reroll(1, 1, 0, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('No rerolls left');
      }
    });

    it('should throw error when session is not active', async () => {
      const inactiveSession = {
        ...mockSession,
        Status: SlotSessionStatus.Ended,
      } as unknown as SlotSession;

      mockSlotMachineService.FindOne.mockResolvedValue(mockSlotMachine);
      slotSessionRepo.findOne.mockResolvedValue(inactiveSession);

      try {
        await service.reroll(1, 1, 0, 'user1');
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          fail('Expected an Error instance');
        }

        expect(error.message).toBe('Session is not active');
      }
    });
  });
});
