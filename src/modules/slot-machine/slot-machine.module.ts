import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotMachineService } from './application/slot-machine.service';
import { SlotMachineController } from './presentation/slot-machine.controller';
import { AdminSlotMachineController } from './presentation/admin-slot-machine.controller';
import { SlotMachine } from './domain/slot-machine.entity';
import { SlotSession } from './sessions/domain/slot-session.entity';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlotMachine, SlotSession]),
    SessionsModule,
  ],
  providers: [SlotMachineService],
  controllers: [SlotMachineController, AdminSlotMachineController],
  exports: [SlotMachineService],
})
export class SlotMachineModule {}
