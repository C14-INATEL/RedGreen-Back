import { SlotSymbol } from '../enums/slot-symbol.enum';

export interface SpinReelResult {
  ReelIndex: number;
  SymbolId: SlotSymbol;
}

export interface CurrentSpinResultState {
  Reels: SpinReelResult[];
}

export interface RerollState {
  Rerolls: {
    Max: number;
    Used: number;
  };
}
