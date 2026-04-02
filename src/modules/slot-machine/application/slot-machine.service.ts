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

  async create(dto: CreateSlotMachineDto): Promise<SlotMachine> {
    const SlotMachine = this.SlotMachineRepo.create(dto);
    return this.SlotMachineRepo.save(SlotMachine);
  }

  async findAll(): Promise<SlotMachine[]> {
    return this.SlotMachineRepo.find();
  }

  async findOne(id: number): Promise<SlotMachine> {
    const SlotMachine = await this.SlotMachineRepo.findOneBy({
      SlotMachineId: id,
    });
    if (!SlotMachine) {
      throw new NotFoundException(`SlotMachine with ID ${id} not found`);
    }
    return SlotMachine;
  }

  async update(id: number, dto: UpdateSlotMachineDto): Promise<SlotMachine> {
    const SlotMachine = await this.findOne(id);

    if (dto.Name !== undefined) {
      SlotMachine.Name = dto.Name;
    }
    if (dto.Description !== undefined) {
      SlotMachine.Description = dto.Description;
    }
    if (dto.MinimumSpinValue !== undefined) {
      SlotMachine.MinimumSpinValue = dto.MinimumSpinValue;
    }
    if (dto.MinimumChipsRequired !== undefined) {
      SlotMachine.MinimumChipsRequired = dto.MinimumChipsRequired;
    }
    if (dto.MinimumRerollValue !== undefined) {
      SlotMachine.MinimumRerollValue = dto.MinimumRerollValue;
    }
    if (dto.MaxRerolls !== undefined) {
      SlotMachine.MaxRerolls = dto.MaxRerolls;
    }
    if (dto.Active !== undefined) {
      SlotMachine.Active = dto.Active;
    }

    return this.SlotMachineRepo.save(SlotMachine);
  }

  async deactivate(id: number): Promise<SlotMachine> {
    const SlotMachine = await this.findOne(id);
    SlotMachine.Active = false;
    return this.SlotMachineRepo.save(SlotMachine);
  }

  async remove(id: number): Promise<void> {
    const SlotMachine = await this.findOne(id);
    await this.SlotMachineRepo.remove(SlotMachine);
  }
}
