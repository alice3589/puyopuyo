export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'empty';

export interface Puyo {
  color: PuyoColor;
  x: number;
  y: number;
}

export interface GameState {
  field: PuyoColor[][];
  currentPuyo: Puyo[];
  nextPuyo: Puyo[];
  score: number;
  gameOver: boolean;
}

export const FIELD_WIDTH = 6;
export const FIELD_HEIGHT = 12;
export const PUYO_SIZE = 40; 