import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { SlotMachine } from '../domain/slot-machine.entity';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';
import { UpdateSlotMachineDto } from '../domain/dto/update-slot-machine.dto';
import {
  SlotSession,
  SlotSessionStatus,
} from '../sessions/domain/slot-session.entity';
import { User } from '../../auth/domain/user.entity';
import { SessionRegistryService } from '../../sessions/application/session-registry.service';
import { ActiveSessionResponseDto } from '../../sessions/domain/dto/active-session-response.dto';

@Injectable()
export class SlotMachineService {
  constructor(
    @InjectRepository(SlotMachine)
    private readonly SlotMachineRepo: Repository<SlotMachine>,
    @InjectRepository(SlotSession)
    private readonly SlotSessionRepo: Repository<SlotSession>,
    private readonly dataSource: DataSource,
    private readonly sessionRegistryService: SessionRegistryService
  ) {}

  async Create(DTO: CreateSlotMachineDto): Promise<SlotMachine> {
    const SlotMachine = this.SlotMachineRepo.create(DTO);
    return this.SlotMachineRepo.save(SlotMachine);
  }

  async FindAll(): Promise<SlotMachine[]> {
    return this.SlotMachineRepo.find();
  }

  async FindOne(Id: number): Promise<SlotMachine> {
    const SlotMachine = await this.SlotMachineRepo.findOneBy({
      SlotMachineId: Id,
    });
    if (!SlotMachine) {
      throw new NotFoundException(`SlotMachine with ID ${Id} not found`);
    }
    return SlotMachine;
  }

  async Update(Id: number, DTO: UpdateSlotMachineDto): Promise<SlotMachine> {
    const SlotMachine = await this.FindOne(Id);

    if (DTO.Name !== undefined) {
      SlotMachine.Name = DTO.Name;
    }
    if (DTO.Description !== undefined) {
      SlotMachine.Description = DTO.Description;
    }
    if (DTO.MinimumSpinValue !== undefined) {
      SlotMachine.MinimumSpinValue = DTO.MinimumSpinValue;
    }
    if (DTO.MinimumChipsRequired !== undefined) {
      SlotMachine.MinimumChipsRequired = DTO.MinimumChipsRequired;
    }
    if (DTO.MinimumRerollValue !== undefined) {
      SlotMachine.MinimumRerollValue = DTO.MinimumRerollValue;
    }
    if (DTO.TableColor !== undefined) {
      SlotMachine.TableColor = DTO.TableColor;
    }
    return this.SlotMachineRepo.save(SlotMachine);
  }

  async Deactivate(Id: number): Promise<SlotMachine> {
    const SlotMachine = await this.FindOne(Id);
    SlotMachine.Active = !SlotMachine.Active;
    return this.SlotMachineRepo.save(SlotMachine);
  }

  async Remove(Id: number): Promise<void> {
    const SlotMachine = await this.FindOne(Id);

    const activeSessionCount = await this.SlotSessionRepo.count({
      where: {
        SlotMachineId: Id,
        Status: SlotSessionStatus.InProgress,
      },
    });

    if (activeSessionCount > 0) {
      throw new BadRequestException(
        'Cannot delete slot machine while there are active sessions.'
      );
    }

    await this.SlotMachineRepo.remove(SlotMachine);
  }

  async FindActiveSessions(Id: number): Promise<ActiveSessionResponseDto[]> {
    await this.FindOne(Id);
    const Sessions = await this.SlotSessionRepo.find({
      where: {
        SlotMachineId: Id,
        Status: SlotSessionStatus.InProgress,
        DeletedAt: IsNull(),
      },
      relations: { User: true },
    });
    return Sessions.map((s) => ({
      UserId: s.UserId,
      Nickname: s.User.Nickname,
      Status: s.Status,
      PotentialPayout: s.CurrentRewardSnapshot,
    }));
  }

  async AdminDeactivate(
    Id: number
  ): Promise<{ ClosedSessions: number; ChipsReturned: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const FoundMachine = await manager.findOne(SlotMachine, {
        where: { SlotMachineId: Id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!FoundMachine) {
        throw new NotFoundException(`SlotMachine with ID ${Id} not found`);
      }

      FoundMachine.Active = false;
      await manager.save(SlotMachine, FoundMachine);

      const ActiveSessions = await manager.find(SlotSession, {
        where: {
          SlotMachineId: Id,
          Status: SlotSessionStatus.InProgress,
          DeletedAt: IsNull(),
        },
        lock: { mode: 'pessimistic_write' },
      });

      let ChipsReturned = 0;
      const Now = new Date();

      for (const Session of ActiveSessions) {
        const Valor = Session.CurrentRewardSnapshot;

        await manager.increment(
          User,
          { UserId: Session.UserId },
          'ChipBalance',
          Valor
        );

        Session.Status = SlotSessionStatus.CashedOut;
        Session.EndedAt = Now;
        await manager.save(SlotSession, Session);

        await this.sessionRegistryService.release(manager, Session.UserId);

        ChipsReturned += Valor;
      }

      await queryRunner.commitTransaction();

      return { ClosedSessions: ActiveSessions.length, ChipsReturned };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
