import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SlotMachineColor } from './enums/slot-machine-color.enum';

@Check(
  'CHK_SlotMachine_NonNegative',
  '("MinimumSpinValue" IS NULL OR "MinimumSpinValue" >= 0) AND ("MinimumChipsRequired" IS NULL OR "MinimumChipsRequired" >= 0) AND ("MinimumRerollValue" IS NULL OR "MinimumRerollValue" >= 0)'
)
@Entity({ name: 'SlotMachine' })
export class SlotMachine {
  @PrimaryGeneratedColumn()
  SlotMachineId: number;

  @Column({ type: 'varchar' })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string | null;

  @Column({ type: 'int', nullable: true })
  MinimumSpinValue: number | null;

  @Column({ type: 'int', nullable: true })
  MinimumChipsRequired: number | null;

  @Column({ type: 'int', nullable: true })
  MinimumRerollValue: number | null;

  @Column({ default: true })
  Active: boolean;

  @Column({
    type: 'varchar',
    enum: SlotMachineColor,
    default: SlotMachineColor.White,
  })
  TableColor: SlotMachineColor;
}
