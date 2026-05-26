export interface CardEffect {
  Type: string;
  Value?: number;
}

export interface GridCard {
  Position: number;
  Points: number;
  Effect: CardEffect | null;
}

export interface PendingEvent {
  Phase: string;
  OfferedEffects: CardEffect[];
  TargetPosition: number;
}

export interface CurrentGridSnapshot {
  Unrevealed: GridCard[];
  Revealed: GridCard[];
  PendingEvent: PendingEvent | null;
}
