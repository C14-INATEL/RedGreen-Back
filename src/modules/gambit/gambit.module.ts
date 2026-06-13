import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitTable } from './domain/gambit-table.entity';
import { GambitSession } from './sessions/domain/gambit-session.entity';
import { GambitTableService } from './application/gambit-table.service';
import { GambitTableController } from './presentation/gambit-table.controller';
import { AdminGambitTableController } from './presentation/admin-gambit-table.controller';
import { GambitSessionModule } from './sessions/gambit-session.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GambitTable, GambitSession]),
    GambitSessionModule,
    SessionsModule,
  ],
  providers: [GambitTableService],
  controllers: [GambitTableController, AdminGambitTableController],
  exports: [GambitTableService],
})
export class GambitModule {}
