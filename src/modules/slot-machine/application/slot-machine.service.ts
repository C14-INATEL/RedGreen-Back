import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotMachine } from '../domain/slot-machine.entity';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';
import { UpdateSlotMachineDto } from '../domain/dto/update-slot-machine.dto';

@Injectable()
export class SlotMachineService {
  constructor(
    @InjectRepository(SlotMachine)
    private readonly SlotMachineRepo: Repository<SlotMachine>
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
    if (DTO.MaxRerolls !== undefined) {
      SlotMachine.MaxRerolls = DTO.MaxRerolls;
    }
    if (DTO.Active !== undefined) {
      SlotMachine.Active = DTO.Active;
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
    await this.SlotMachineRepo.remove(SlotMachine);
  }
}
