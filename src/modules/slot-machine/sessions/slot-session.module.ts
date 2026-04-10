import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotSessionController } from './presentation/slot-session.controller';
import { CurrentSessionController } from './presentation/current-session.controller';
import { SlotSessionService } from './application/slot-session.service';
import { SlotSession } from './domain/slot-session.entity';
import { SlotMachine } from '../domain/slot-machine.entity';
import { User } from '../../auth/domain/user.entity';
import { AuthModule } from '../../auth/auth.module';
import { SlotMachineModule } from '../slot-machine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlotSession, SlotMachine, User]),
    AuthModule,
    SlotMachineModule,
  ],
  providers: [SlotSessionService],
  controllers: [SlotSessionController, CurrentSessionController],
  exports: [SlotSessionService],
})
export class SlotSessionModule {}
