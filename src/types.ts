import type { Ref } from 'vue';

export interface Point {
  x: number;
  y: number;
}

export interface Curve {
  id: number;
  weights: number[];
  fitness: number;
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
  step?: number;
  decimals?: number;
  logarithmic?: boolean;
  logMidpoint?: number;
  useScientificNotation?: boolean;
}

export interface Particle {
  weights: number[];
  velocity: number[];
  bestWeights: number[];
  bestFitness: number;
}

export type MutationDistribution = 'normal' | 'uniform';

export type SolutionMethod =
  | 'genetic'
  | 'gradient'
  | 'adam'
  | 'simulated-annealing'
  | 'particle-swarm'
  | 'momentum'
  | 'polynomial-solver'
  | 'random-search';

export interface AlgorithmInfo {
  id: SolutionMethod;
  name: string;
  color: string;
}
