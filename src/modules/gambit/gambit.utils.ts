import {
  BASE_SEG1_CEIL,
  BASE_SEG2_CEIL,
  BASE_SEG3_CEIL,
  EXP1,
  EXP2,
  EXP3,
} from './gambit.constants';

export function CalcMultiplier(
  CardsPurchased: number,
  TableMultiplier: number
): number {
  const Seg1Ceil = 1 + (BASE_SEG1_CEIL - 1) * TableMultiplier;
  const Seg2Ceil = 1 + (BASE_SEG2_CEIL - 1) * TableMultiplier;
  const Seg3Ceil = 1 + (BASE_SEG3_CEIL - 1) * TableMultiplier;

  if (CardsPurchased <= 5) {
    return 1 + (Seg1Ceil - 1) * Math.pow(CardsPurchased / 5, EXP1);
  } else if (CardsPurchased <= 15) {
    const T = (CardsPurchased - 5) / 10;
    return Seg1Ceil + (Seg2Ceil - Seg1Ceil) * Math.pow(T, EXP2);
  } else {
    const T = (CardsPurchased - 15) / 5;
    return Seg2Ceil + (Seg3Ceil - Seg2Ceil) * Math.pow(T, EXP3);
  }
}
