import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  GambitSession,
  GambitSessionStatus,
} from '../domain/gambit-session.entity';
import { GambitTable } from '../../domain/gambit-table.entity';
import { CreateGambitSessionDto } from '../domain/dto/create-gambit-session.dto';
import { UpdateGambitSessionDto } from '../domain/dto/update-gambit-session.dto';
import { FIRST_EVENT_RANGE, SECOND_EVENT_RANGE } from '../../gambit.constants';
import { SessionRegistryService } from '../../../sessions/application/session-registry.service';
import { GameType } from '../../../sessions/domain/enums/game-type.enum';
import { ActiveSession } from '../../../sessions/domain/active-session.entity';

@Injectable()
export class GambitSessionService {
  constructor(
    @InjectRepository(GambitSession)
    private readonly GambitSessionRepo: Repository<GambitSession>,
    private readonly dataSource: DataSource,
    private readonly sessionRegistryService: SessionRegistryService
  ) {}

  async Create(
    GambitTableId: number,
    DTO: CreateGambitSessionDto,
    UserId: string
  ): Promise<GambitSession> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const FoundTable = await manager.findOne(GambitTable, {
        where: { GambitTableId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!FoundTable) {
        throw new NotFoundException(
          `GambitTable with ID ${GambitTableId} not found`
        );
      }

      if (!FoundTable.Active) {
        throw new BadRequestException('This gambit table is not active');
      }

      const ExistingActive = await manager.findOne(ActiveSession, {
        where: { UserId },
      });

      if (ExistingActive) {
        throw new ConflictException(
          'Você já está em uma partida. Encerre a mesa atual antes de entrar em outra.'
        );
      }

      const NewSession = manager.create(GambitSession, {
        ...DTO,
        GambitTableId,
        UserId,
        Status: GambitSessionStatus.InProgress,
        BurnSlotsAvailable: DTO.CardsPurchased,
        FirstEventFlip:
          Math.floor(
            Math.random() * (FIRST_EVENT_RANGE.MAX - FIRST_EVENT_RANGE.MIN + 1)
          ) + FIRST_EVENT_RANGE.MIN,
        SecondEventFlip:
          Math.floor(
            Math.random() *
              (SECOND_EVENT_RANGE.MAX - SECOND_EVENT_RANGE.MIN + 1)
          ) + SECOND_EVENT_RANGE.MIN,
      });
      const SavedSession = await manager.save(GambitSession, NewSession);

      await this.sessionRegistryService.acquire(
        manager,
        UserId,
        GameType.Gambit,
        SavedSession.GambitSessionId
      );

      await queryRunner.commitTransaction();

      return SavedSession;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private ValidateNoBlockingState(Session: GambitSession): void {
    const Snapshot = Session.CurrentGridSnapshot;
    if (!Snapshot) return;
    if (Snapshot.PendingEvent !== null) {
      throw new BadRequestException(
        'Cannot perform action: a pending event must be resolved first'
      );
    }
    if (Snapshot.PendingInteraction !== null) {
      throw new BadRequestException(
        'Cannot perform action: a pending interaction must be resolved first'
      );
    }
  }

  async FindAll(
    GambitTableId: number,
    UserId: string
  ): Promise<GambitSession[]> {
    return this.GambitSessionRepo.find({
      where: { GambitTableId, UserId },
    });
  }

  async FindOne(
    GambitTableId: number,
    Id: number,
    UserId: string
  ): Promise<GambitSession> {
    const Session = await this.GambitSessionRepo.findOne({
      where: { GambitSessionId: Id, GambitTableId, UserId },
    });
    if (!Session) {
      throw new NotFoundException(
        `GambitSession with ID ${Id} not found for this gambit table and user`
      );
    }
    return Session;
  }

  async Update(
    GambitTableId: number,
    Id: number,
    DTO: UpdateGambitSessionDto,
    UserId: string
  ): Promise<GambitSession> {
    const Session = await this.FindOne(GambitTableId, Id, UserId);
    Object.assign(Session, DTO);
    return this.GambitSessionRepo.save(Session);
  }

  async Remove(
    GambitTableId: number,
    Id: number,
    UserId: string
  ): Promise<void> {
    const Session = await this.FindOne(GambitTableId, Id, UserId);
    await this.GambitSessionRepo.remove(Session);
  }
}
