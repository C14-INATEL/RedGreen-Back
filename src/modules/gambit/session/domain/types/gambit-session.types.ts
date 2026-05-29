export enum GambitCard {
  DOBRO_DE_POTASSIO = 'DOBRO_DE_POTASSIO',
  MELANCIDIO = 'MELANCIDIO',
  CLARIVIDENCIA = 'CLARIVIDENCIA',
  INVERSAO_GRAVITACIONAL = 'INVERSAO_GRAVITACIONAL',
}

export type GambitCardNature = 'Good' | 'Bad' | 'Neutral';
export type GambitCardEffect = 'MULTIPLY' | 'DIVIDE' | 'REVEAL' | 'INVERT';

export type GambitCardDefinition = {
  nature: GambitCardNature;
  effect: GambitCardEffect;
  value?: number;
};

export const GambitCardConfig: Record<GambitCard, GambitCardDefinition> = {
  [GambitCard.DOBRO_DE_POTASSIO]: {
    nature: 'Good',
    effect: 'MULTIPLY',
    value: 2,
  },
  [GambitCard.MELANCIDIO]: { nature: 'Bad', effect: 'DIVIDE', value: 2 },
  [GambitCard.CLARIVIDENCIA]: { nature: 'Neutral', effect: 'REVEAL' },
  [GambitCard.INVERSAO_GRAVITACIONAL]: { nature: 'Neutral', effect: 'INVERT' },
};

export type GridPosition = {
  Position: number;
  Points: number;
  Effect: GambitCard | null;
};

export type PendingEvent = {
  EventType: 'Good' | 'Bad' | 'Neutral';
  CardsOffered: [GambitCard, GambitCard, GambitCard];
};

export type CurrentGridSnapshot = {
  Unrevealed: GridPosition[];
  Revealed: GridPosition[];
  PendingEvent: PendingEvent | null;
};
