import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotMachine } from '../domain/slot-machine.entity';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';
import { UpdateSlotMachineDto } from '../domain/dto/update-slot-machine.dto';
import {
  SlotSession,
  SlotSessionStatus,
} from '../sessions/domain/slot-session.entity';

@Injectable()
export class SlotMachineService {
  constructor(
    @InjectRepository(SlotMachine)
    private readonly SlotMachineRepo: Repository<SlotMachine>,
    @InjectRepository(SlotSession)
    private readonly SlotSessionRepo: Repository<SlotSession>
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
}
