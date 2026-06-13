import { JACKPOT_POINTS } from '../../../gambit.constants';

export enum GambitCard {
  DOBRO_DE_POTASSIO = 'DOBRO_DE_POTASSIO',
  MELANCIDIO = 'MELANCIDIO',
  CLARIVIDENCIA = 'CLARIVIDENCIA',
  INVERSAO_GRAVITACIONAL = 'INVERSAO_GRAVITACIONAL',
  JONAS_JOKER = 'JONAS_JOKER',
  CHRIS_JOKER = 'CHRIS_JOKER',
  ANULACAO_TOTAL = 'ANULACAO_TOTAL',
  QUANTO_MENOS_MELHOR = 'QUANTO_MENOS_MELHOR',
  QUANTO_MAIS_MELHOR = 'QUANTO_MAIS_MELHOR',
  MENTE_LISA = 'MENTE_LISA',
  MOSCA_JOKER = 'MOSCA_JOKER',
  CABECINHA = 'CABECINHA',
  COLORIDINHO = 'COLORIDINHO',
  JACKPOT = 'JACKPOT',
  RATIMUNDIO = 'RATIMUNDIO',
  HEADGEAR = 'HEADGEAR',
  BUMIS_INFILTRADOS = 'BUMIS_INFILTRADOS',
  PAO_COM_OQUE = 'PAO_COM_OQUE',
}

export type GambitCardNature = 'Good' | 'Bad' | 'Neutral';

export type GambitCardEffect =
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'REVEAL'
  | 'INVERT'
  | 'RANDOM_POINTS'
  | 'RESET_POINTS'
  | 'CANCEL_NEXT_BURN'
  | 'REMOVE_BURN_SLOT'
  | 'ADD_BURN_SLOT'
  | 'LOCK_GOOD_CARD'
  | 'TRANSFORM_CARD'
  | 'PEEK_CARDS'
  | 'NULLIFY_NEXT_SCORE'
  | 'JACKPOT'
  | 'FORCE_NEGATIVE_NEXT'
  | 'NO_OP'
  | 'SABOTAGE_HIGHEST';

export type GambitCardDefinition = {
  label: string;
  nature: GambitCardNature;
  effect: GambitCardEffect;
  value?: number;
};

export const GambitCardConfig: Record<GambitCard, GambitCardDefinition> = {
  [GambitCard.DOBRO_DE_POTASSIO]: {
    label: 'Dobro de Potássio',
    nature: 'Good',
    effect: 'MULTIPLY',
    value: 2,
  },
  [GambitCard.MELANCIDIO]: {
    label: 'Melancídio',
    nature: 'Bad',
    effect: 'DIVIDE',
    value: 2,
  },
  [GambitCard.CLARIVIDENCIA]: {
    label: 'Clarividência',
    nature: 'Good',
    effect: 'REVEAL',
  },
  [GambitCard.INVERSAO_GRAVITACIONAL]: {
    label: 'Inversão gravitacional',
    nature: 'Neutral',
    effect: 'INVERT',
  },
  [GambitCard.JONAS_JOKER]: {
    label: 'Jonas Joker',
    nature: 'Neutral',
    effect: 'RANDOM_POINTS',
  },
  [GambitCard.CHRIS_JOKER]: {
    label: 'Chris Joker',
    nature: 'Neutral',
    effect: 'RESET_POINTS',
  },
  [GambitCard.ANULACAO_TOTAL]: {
    label: 'Anulação total',
    nature: 'Good',
    effect: 'CANCEL_NEXT_BURN',
  },
  [GambitCard.QUANTO_MENOS_MELHOR]: {
    label: 'Quanto menos melhor',
    nature: 'Neutral',
    effect: 'REMOVE_BURN_SLOT',
  },
  [GambitCard.QUANTO_MAIS_MELHOR]: {
    label: 'Quanto mais melhor',
    nature: 'Neutral',
    effect: 'ADD_BURN_SLOT',
  },
  [GambitCard.MENTE_LISA]: {
    label: 'Mente lisa',
    nature: 'Bad',
    effect: 'LOCK_GOOD_CARD',
  },
  [GambitCard.MOSCA_JOKER]: {
    label: 'Mosca Joker',
    nature: 'Neutral',
    effect: 'TRANSFORM_CARD',
  },
  [GambitCard.CABECINHA]: {
    label: 'Cabecinha',
    nature: 'Good',
    effect: 'PEEK_CARDS',
  },
  [GambitCard.COLORIDINHO]: {
    label: 'Coloridinho',
    nature: 'Neutral',
    effect: 'NULLIFY_NEXT_SCORE',
  },
  [GambitCard.JACKPOT]: {
    label: 'Jackpot!',
    nature: 'Good',
    effect: 'JACKPOT',
    value: JACKPOT_POINTS,
  },
  [GambitCard.RATIMUNDIO]: {
    label: 'Ratimundio!',
    nature: 'Bad',
    effect: 'JACKPOT',
    value: -JACKPOT_POINTS,
  },
  [GambitCard.HEADGEAR]: {
    label: 'Headgear',
    nature: 'Bad',
    effect: 'FORCE_NEGATIVE_NEXT',
  },
  [GambitCard.BUMIS_INFILTRADOS]: {
    label: 'Bumis Infiltrados',
    nature: 'Bad',
    effect: 'NO_OP',
  },
  [GambitCard.PAO_COM_OQUE]: {
    label: 'Pão com OQUE?',
    nature: 'Bad',
    effect: 'SABOTAGE_HIGHEST',
  },
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
  RANDOM_POINTS: {
    description: 'Grants a random amount of points (positive or negative)',
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
  NULLIFY_NEXT_SCORE: {
    description:
      'The next burned card scores 0 points (its own effect still applies)',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  JACKPOT: {
    description: 'Grants a large fixed amount of points (positive or negative)',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  FORCE_NEGATIVE_NEXT: {
    description: 'The next burned card always subtracts points (made negative)',
    appliedOn: 'NEXT_BURN',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  NO_OP: {
    description: 'Does nothing (trap card that pretends to be a good effect)',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'NONE',
  },
  SABOTAGE_HIGHEST: {
    description:
      'The highest-points unrevealed card on the board becomes negative (not revealed)',
    appliedOn: 'IMMEDIATE',
    requiresUserInteraction: false,
    targetSelection: 'AUTOMATIC',
  },
};

export type GridPosition = {
  Position: number;
  Points: number;
  Effect: GambitCard | null;
  Locked: boolean;
};

export type PendingEvent = {
  GoodOptions: GambitCard[];
  BadOptions: GambitCard[];
};

export type PendingInteraction = {
  Effect: GambitCard;
  Action: 'SELECT_CARD' | 'SELECT_MULTIPLE_CARDS';
  RequiredSelections: number;
  SelectedPositions: number[];
};

export type CurrentGridSnapshot = {
  Unrevealed: GridPosition[];
  Revealed: GridPosition[];
  PendingEvent: PendingEvent | null;
  PendingInteraction: PendingInteraction | null;
  EventsFired: number[];
};

export type GambitUnrevealedView = {
  Position: number;
  Locked: boolean;
};

export type GambitGridView = {
  Revealed: GridPosition[];
  Unrevealed: GambitUnrevealedView[];
  PendingEvent: PendingEvent | null;
  PendingInteraction: PendingInteraction | null;
};

export type GambitSessionView = {
  GambitSessionId: number;
  GambitTableId: number;
  UserId: string;
  CardsPurchased: number;
  BurnSlotsAvailable: number;
  ManualFlipsCount: number;
  BurnsRemaining: number;
  AccumulatedPoints: number;
  NextEffect: GambitCard | null;
  Status: string;
  Result: number | null;
  Grid: GambitGridView;
};
