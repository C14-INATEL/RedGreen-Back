import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('slot_machine')
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

  @Column({ type: 'int', default: 0 })
  MaxRerolls: number;

  @Column({ default: true })
  Active: boolean;
}
