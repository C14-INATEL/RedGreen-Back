import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Check(
  'CHK_SlotMachine_NonNegative',
  '"MaxRerolls" >= 0 AND ("MinimumSpinValue" IS NULL OR "MinimumSpinValue" >= 0) AND ("MinimumChipsRequired" IS NULL OR "MinimumChipsRequired" >= 0) AND ("MinimumRerollValue" IS NULL OR "MinimumRerollValue" >= 0)'
)
@Entity({ name: 'SlotMachine' })
export class SlotMachine {
  @PrimaryGeneratedColumn()
  SlotMachineId: number;

  @Column()
  Name: string;

  @Column({ nullable: true })
  Description: string;

  @Column({ nullable: true })
  MinimumSpinValue: number;

  @Column({ nullable: true })
  MinimumChipsRequired: number;

  @Column({ nullable: true })
  MinimumRerollValue: number;

  @Column({ type: 'int', default: 5 })
  MaxRerolls: number;

  @Column({ default: true })
  Active: boolean;
}
