export enum GambitCard {
  DOBRO_DE_POTASSIO = 'DOBRO_DE_POTASSIO',
  MELANCIDIO = 'MELANCIDIO',
  CLARIVIDENCIA = 'CLARIVIDENCIA',
  INVERSAO_GRAVITACIONAL = 'INVERSAO_GRAVITACIONAL',
  JONAS_JOKER = 'JONAS_JOKER',
  CORINGA_DO_INATEL = 'CORINGA_DO_INATEL',
  ANULACAO_TOTAL = 'ANULACAO_TOTAL',
  QUANTO_MENOS_MELHOR = 'QUANTO_MENOS_MELHOR',
  QUANTO_MAIS_MELHOR = 'QUANTO_MAIS_MELHOR',
  MENTE_LISA = 'MENTE_LISA',
  MOSCA_JOKER = 'MOSCA_JOKER',
  CABECINHA = 'CABECINHA',
}

export type GambitCardNature = 'Good' | 'Bad' | 'Neutral';

export type GambitCardEffect =
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'REVEAL'
  | 'INVERT'
  | 'RANDOM_CHIPS'
  | 'RESET_POINTS'
  | 'CANCEL_NEXT_BURN'
  | 'REMOVE_BURN_SLOT'
  | 'ADD_BURN_SLOT'
  | 'LOCK_GOOD_CARD'
  | 'TRANSFORM_CARD'
  | 'PEEK_CARDS';

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
  [GambitCard.JONAS_JOKER]: { nature: 'Neutral', effect: 'RANDOM_CHIPS' },
  [GambitCard.CORINGA_DO_INATEL]: { nature: 'Bad', effect: 'RESET_POINTS' },
  [GambitCard.ANULACAO_TOTAL]: {
    nature: 'Neutral',
    effect: 'CANCEL_NEXT_BURN',
  },
  [GambitCard.QUANTO_MENOS_MELHOR]: {
    nature: 'Bad',
    effect: 'REMOVE_BURN_SLOT',
  },
  [GambitCard.QUANTO_MAIS_MELHOR]: { nature: 'Good', effect: 'ADD_BURN_SLOT' },
  [GambitCard.MENTE_LISA]: { nature: 'Good', effect: 'LOCK_GOOD_CARD' },
  [GambitCard.MOSCA_JOKER]: { nature: 'Neutral', effect: 'TRANSFORM_CARD' },
  [GambitCard.CABECINHA]: { nature: 'Good', effect: 'PEEK_CARDS' },
};

export type GambitEffectDefinition = {
  description: string;
  appliedOn: 'IMMEDIATE' | 'NEXT_BURN';
  requiresUserInteraction: boolean;
  targetSelection: 'NONE' | 'AUTOMATIC' | 'USER';
};

export const GambitEffectConfig: Record<
  GambitCardEffect,
  GambitEffectDefinition
> = {
  MULTIPLY: {
    description: 'Multiplies the points of the next burned card',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  DIVIDE: {
    description: 'Divides the points of the next burned card',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  INVERT: {
    description: 'Inverts the points of the next burned card',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  CANCEL_NEXT_BURN: {
    description:
      'The next burned card will have its effect completely cancelled',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  REVEAL: {
    description: 'Player selects a card to peek its content without burning it',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: true,
    targetSelection: 'USER',
  },
  PEEK_CARDS: {
    description:
      'Player selects 3 cards and is warned if at least one of them is bad',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: true,
    targetSelection: 'USER',
  },
  RANDOM_CHIPS: {
    description: 'Grants a random amount of chips (positive or negative)',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  RESET_POINTS: {
    description: 'Completely resets all accumulated points',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  REMOVE_BURN_SLOT: {
    description: 'Removes one of the mandatory cards that must be burned',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  ADD_BURN_SLOT: {
    description: 'Grants one extra card slot to burn',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  LOCK_GOOD_CARD: {
    description:
      'Locks a good unrevealed card on the board so it cannot be burned',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'AUTOMATIC',
  },
  TRANSFORM_CARD: {
    description: 'Transforms a card on the board into a power card',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'AUTOMATIC',
  },
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
