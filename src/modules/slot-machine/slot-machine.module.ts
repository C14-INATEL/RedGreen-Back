import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotMachineService } from './application/slot-machine.service';
import { SlotMachineController } from './presentation/slot-machine.controller';
import { SlotMachine } from './domain/slot-machine.entity';
import { SlotSession } from './sessions/domain/slot-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotMachine, SlotSession])],
  providers: [SlotMachineService],
  controllers: [SlotMachineController],
  exports: [SlotMachineService],
})
export class SlotMachineModule {}
