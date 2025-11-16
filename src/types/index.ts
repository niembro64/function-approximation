import type { Ref } from 'vue';

export interface Point {
  x: number;
  y: number;
}

export interface Curve {
  id: number;
  weights: number[];
  loss: number;
}

export interface CanvasCoords {
  cx: number;
  cy: number;
}

export interface CoordSystemCoords {
  x: number;
  y: number;
}

export interface SliderConfig {
  label: string;
  model: Ref<number>;
  min: number;
  max: number;
  step?: number | null;
  decimals?: number | null;
  logarithmic?: boolean | null;
  logMidpoint?: number | null;
  useScientificNotation?: boolean | null;
}

export type SolutionMethod = 'genetic' | 'gradient' | 'adam';

export interface AdamState {
  m: number[];
  v: number[];
  t: number;
}
