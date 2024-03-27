export interface ScoreRelationship {
  label: string;
  value: number;
  percent: number;
  scx: number;
}

export interface ScoreChainBtcScore {
  scx: number;
  relationships: ReadonlyArray<ScoreRelationship>;
}

export interface ScoreChainBTCResult {
  result: ScoreChainBtcScore;
  remaining?: number;
  error?: string;
}
