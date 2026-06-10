import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GambitTable } from './domain/gambit-table.entity';
import { GambitSession } from './sessions/domain/gambit-session.entity';
import { GambitTableService } from './application/gambit-table.service';
import { GambitTableController } from './presentation/gambit-table.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GambitTable, GambitSession])],
  providers: [GambitTableService],
  controllers: [GambitTableController],
  exports: [GambitTableService],
})
export class GambitModule {}
