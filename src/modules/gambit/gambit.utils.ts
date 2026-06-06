import {
  BASE_SEG1_CEIL,
  BASE_SEG2_CEIL,
  BASE_SEG3_CEIL,
  EXP1,
  EXP2,
  EXP3,
} from './gambit.constants';

export function calcMultiplier(
  cardsPurchased: number,
  tableMultiplier: number
): number {
  const seg1Ceil = 1 + (BASE_SEG1_CEIL - 1) * tableMultiplier;
  const seg2Ceil = 1 + (BASE_SEG2_CEIL - 1) * tableMultiplier;
  const seg3Ceil = 1 + (BASE_SEG3_CEIL - 1) * tableMultiplier;

  if (cardsPurchased <= 5) {
    return 1 + (seg1Ceil - 1) * Math.pow(cardsPurchased / 5, EXP1);
  } else if (cardsPurchased <= 15) {
    const t = (cardsPurchased - 5) / 10;
    return seg1Ceil + (seg2Ceil - seg1Ceil) * Math.pow(t, EXP2);
  } else {
    const t = (cardsPurchased - 15) / 5;
    return seg2Ceil + (seg3Ceil - seg2Ceil) * Math.pow(t, EXP3);
  }
}
