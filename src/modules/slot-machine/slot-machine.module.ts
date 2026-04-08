import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotMachineService } from './application/slot-machine.service';
import { SlotMachineController } from './presentation/slot-machine.controller';
import { SlotMachine } from './domain/slot-machine.entity';
import { SlotSessionService } from './sessions/application/slot-session.service';
import { SlotSessionController } from './sessions/presentation/slot-session.controller';
import { SlotSession } from './sessions/domain/slot-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotMachine, SlotSession])],
  providers: [SlotMachineService, SlotSessionService],
  controllers: [SlotMachineController, SlotSessionController],
  exports: [SlotMachineService, SlotSessionService],
})
export class SlotMachineModule {}
