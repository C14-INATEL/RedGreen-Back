import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Game' })
export class Game {
  @PrimaryGeneratedColumn('uuid')
  GameId: number;

  @Column()
  Name: string;

  @Column({ type: 'text' })
  Description: string;

  @Column({ type: 'numeric' })
  BaseRewardValue: number;

  @Column({ default: true })
  Active: boolean;
}
