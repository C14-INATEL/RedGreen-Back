import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotMachine } from '../domain/slot-machine.entity';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';

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
}
