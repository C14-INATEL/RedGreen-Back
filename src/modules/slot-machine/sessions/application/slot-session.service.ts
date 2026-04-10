import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { SlotSession, SlotSessionStatus } from '../domain/slot-session.entity';
import { CreateSlotSessionDto } from '../domain/dto/create-slot-session.dto';
import { UpdateSlotSessionDto } from '../domain/dto/update-slot-session.dto';
import { SlotSymbol } from '../domain/enums/slot-symbol.enum';
import type { SpinReelResult } from '../domain/types/slot-session.types';
import { AuthService } from '../../../auth/application/auth.service';
import { SlotMachineService } from '../../application/slot-machine.service';

@Injectable()
export class SlotSessionService {
  constructor(
    @InjectRepository(SlotSession)
    private readonly slotSessionRepo: Repository<SlotSession>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly slotMachineService: SlotMachineService
  ) {}

  async create(
    slotMachineId: number,
    dto: CreateSlotSessionDto,
    userId: string
  ): Promise<{ session: SlotSession; currentBalance: number }> {
    const SlotMachine = await this.slotMachineService.FindOne(slotMachineId);

    const ActiveSessionWithChips = await this.slotSessionRepo.findOne({
      where: {
        UserId: userId,
        Status: SlotSessionStatus.Active,
        DeletedAt: IsNull(),
      },
    });

    if (
      ActiveSessionWithChips &&
      ActiveSessionWithChips.CurrentRewardSnapshot > 0
    ) {
      throw new BadRequestException(
        'Cannot start new session while having chips in any machine. Please cash out first.'
      );
    }

    if (ActiveSessionWithChips) {
      ActiveSessionWithChips.Status = SlotSessionStatus.Ended;
      ActiveSessionWithChips.EndedAt = new Date();
      await this.slotSessionRepo.save(ActiveSessionWithChips);
    }

    const UserBalanceBeforeSpin = await this.authService.GetChipBalance(userId);
    if (
      SlotMachine.MinimumSpinValue &&
      UserBalanceBeforeSpin.ChipBalance < SlotMachine.MinimumSpinValue
    ) {
      throw new BadRequestException(
        'Insufficient chips to start a new session'
      );
    }

    if (SlotMachine.MinimumSpinValue) {
      await this.authService.UpdateChipBalance(
        userId,
        -SlotMachine.MinimumSpinValue
      );
    }

    const Reels = this.generateRandomReels();
    const Reward = this.calculateReward(Reels);

    const SlotSession = this.slotSessionRepo.create({
      UserId: userId,
      SlotMachineId: slotMachineId,
      Status: dto.Status || SlotSessionStatus.Active,
      StartedAt: dto.StartedAt || new Date(),
      LastInteractionAt: dto.LastInteractionAt || new Date(),
      EndedAt: dto.EndedAt ?? null,
      CurrentRewardSnapshot: Reward,
      CurrentSpinResult: { Reels },
      CurrentRerollsSpent: {
        Rerolls: { Max: SlotMachine.MaxRerolls, Used: 0 },
      },
    });

    const SavedSession = await this.slotSessionRepo.save(SlotSession);
    const FinalBalance = await this.authService.GetChipBalance(userId);

    return {
      session: SavedSession,
      currentBalance: FinalBalance.ChipBalance,
    };
  }

  async findAll(slotMachineId: number, userId: string): Promise<SlotSession[]> {
    return this.slotSessionRepo.find({
      where: {
        SlotMachineId: slotMachineId,
        UserId: userId,
        DeletedAt: IsNull(),
      },
    });
  }

  async findOne(
    slotMachineId: number,
    id: number,
    userId: string
  ): Promise<SlotSession> {
    const SlotSession = await this.slotSessionRepo.findOne({
      where: {
        SlotSessionId: id,
        SlotMachineId: slotMachineId,
        UserId: userId,
        DeletedAt: IsNull(),
      },
    });

    if (!SlotSession) {
      throw new NotFoundException(
        `SlotSession with Id ${id} not found for this slot machine and user`
      );
    }

    return SlotSession;
  }

  async update(
    slotMachineId: number,
    id: number,
    dto: UpdateSlotSessionDto,
    userId: string
  ): Promise<SlotSession> {
    const SlotSession = await this.findOne(slotMachineId, id, userId);
    Object.assign(SlotSession, dto);
    return this.slotSessionRepo.save(SlotSession);
  }

  async findActiveSession(userId: string): Promise<SlotSession | null> {
    const ActiveSession = await this.slotSessionRepo.findOne({
      where: {
        UserId: userId,
        Status: SlotSessionStatus.Active,
        DeletedAt: IsNull(),
      },
    });

    return ActiveSession || null;
  }

  async rerollActive(
    userId: string,
    reelIndex: number
  ): Promise<{ session: SlotSession; currentBalance: number }> {
    const ActiveSession = await this.findActiveSession(userId);

    if (!ActiveSession) {
      throw new NotFoundException('No active session found');
    }

    return this.reroll(
      ActiveSession.SlotMachineId,
      ActiveSession.SlotSessionId,
      reelIndex,
      userId
    );
  }

  async cashOutActive(
    userId: string
  ): Promise<{ message: string; finalBalance: number }> {
    const ActiveSession = await this.findActiveSession(userId);

    if (!ActiveSession) {
      throw new NotFoundException('No active session found');
    }

    return this.cashOut(
      ActiveSession.SlotMachineId,
      ActiveSession.SlotSessionId,
      userId
    );
  }

  async remove(
    slotMachineId: number,
    id: number,
    userId: string
  ): Promise<void> {
    const SlotSession = await this.findOne(slotMachineId, id, userId);
    SlotSession.DeletedAt = new Date();
    await this.slotSessionRepo.save(SlotSession);
  }
  async reroll(
    slotMachineId: number,
    id: number,
    reelIndex: number,
    userId: string
  ): Promise<{ session: SlotSession; currentBalance: number }> {
    const SlotMachine = await this.slotMachineService.FindOne(slotMachineId);
    const SlotSession = await this.findOne(slotMachineId, id, userId);

    if (SlotSession.Status !== SlotSessionStatus.Active) {
      throw new BadRequestException('Session is not active');
    }

    if (
      SlotSession.CurrentRerollsSpent.Rerolls.Used >=
      SlotSession.CurrentRerollsSpent.Rerolls.Max
    ) {
      throw new BadRequestException('No rerolls left');
    }

    if (
      reelIndex < 0 ||
      reelIndex >= SlotSession.CurrentSpinResult.Reels.length
    ) {
      throw new BadRequestException('Invalid reel index');
    }

    const UserBalanceBeforeReroll =
      await this.authService.GetChipBalance(userId);
    if (
      SlotMachine.MinimumRerollValue &&
      UserBalanceBeforeReroll.ChipBalance < SlotMachine.MinimumRerollValue
    ) {
      throw new BadRequestException('Insufficient chips to reroll');
    }

    if (SlotMachine.MinimumRerollValue) {
      await this.authService.UpdateChipBalance(
        userId,
        -SlotMachine.MinimumRerollValue
      );
    }

    const NewSymbol = this.getRandomSymbol();
    SlotSession.CurrentSpinResult.Reels[reelIndex].SymbolId = NewSymbol;

    const NewReward = this.calculateReward(SlotSession.CurrentSpinResult.Reels);
    SlotSession.CurrentRewardSnapshot = NewReward;

    SlotSession.CurrentRerollsSpent.Rerolls.Used += 1;
    SlotSession.LastInteractionAt = new Date();

    const UpdatedSession = await this.slotSessionRepo.save(SlotSession);
    const UserBalanceAfterReroll =
      await this.authService.GetChipBalance(userId);

    return {
      session: UpdatedSession,
      currentBalance: UserBalanceAfterReroll.ChipBalance,
    };
  }

  async cashOut(
    slotMachineId: number,
    id: number,
    userId: string
  ): Promise<{ message: string; finalBalance: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const SessionRepository = queryRunner.manager.getRepository(SlotSession);

      const Session = await SessionRepository.findOne({
        where: {
          SlotSessionId: id,
          SlotMachineId: slotMachineId,
          UserId: userId,
          DeletedAt: IsNull(),
        },
      });

      if (!Session) {
        throw new NotFoundException('Session not found');
      }

      if (Session.Status !== SlotSessionStatus.Active) {
        throw new BadRequestException('Session is not active');
      }

      const Reward = Session.CurrentRewardSnapshot;

      await this.authService.UpdateChipBalance(userId, Reward);

      Session.Status = SlotSessionStatus.Ended;
      Session.EndedAt = new Date();

      await SessionRepository.save(Session);

      await queryRunner.commitTransaction();

      const userBalance = await this.authService.GetChipBalance(userId);
      return {
        message: 'Cash out successful',
        finalBalance: userBalance.ChipBalance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateRandomReels(): SpinReelResult[] {
    const Reels: SpinReelResult[] = [];
    for (let i = 0; i < 4; i++) {
      Reels.push({
        ReelIndex: i,
        SymbolId: this.getRandomSymbol(),
      });
    }
    return Reels;
  }

  private getRandomSymbol(): SlotSymbol {
    const Symbols = Object.values(SlotSymbol);
    return Symbols[Math.floor(Math.random() * Symbols.length)];
  }

  private calculateReward(Reels: SpinReelResult[]): number {
    const SymbolCounts = new Map<SlotSymbol, number>();
    for (const Reel of Reels) {
      SymbolCounts.set(
        Reel.SymbolId,
        (SymbolCounts.get(Reel.SymbolId) || 0) + 1
      );
    }

    let Reward = 0;
    const HasRat = SymbolCounts.get(SlotSymbol.Rat) || 0;
    const HasCheese = SymbolCounts.get(SlotSymbol.Cheese) || 0;

    const EffectiveRat = HasCheese > 0 ? 0 : HasRat;

    if (EffectiveRat > 0) {
      Reward = 0;
    } else {
      const OrangeCount = SymbolCounts.get(SlotSymbol.Orange) || 0;
      if (OrangeCount === 3) Reward += 3;
      else if (OrangeCount === 4) Reward += 5;

      const OrangesCount = SymbolCounts.get(SlotSymbol.Oranges) || 0;
      if (OrangesCount === 3) Reward += 9;
      else if (OrangesCount === 4) Reward += 15;

      const PigCount = SymbolCounts.get(SlotSymbol.Pig) || 0;
      Reward += PigCount * 10;

      const TwoXCount = SymbolCounts.get(SlotSymbol.TwoX) || 0;
      if (TwoXCount > 0) Reward *= 2;

      const WatermelonCount = SymbolCounts.get(SlotSymbol.Watermelon) || 0;
      if (WatermelonCount === 4) Reward += 100;

      if (HasCheese > 0 && HasRat > 0) {
        Reward += HasRat * 3;
      }
    }

    return Reward;
  }
}
