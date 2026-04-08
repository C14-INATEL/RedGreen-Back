export interface SpinReelResult {
  ReelIndex: number;
  SymbolId: string;
}

export interface CurrentSpinResultState {
  reels: SpinReelResult[];
}

export interface RerollState {
  Rerolls: {
    Max: number;
    Used: number;
  };
}
