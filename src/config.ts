import type { SolutionMethod, AlgorithmInfo } from './types';

// ============================================================
// Color Constants
// ============================================================

export const TAILWIND_PURPLE_500: string = '#a855f7';
export const TAILWIND_VIOLET_500: string = '#8b5cf6';
export const TAILWIND_INDIGO_500: string = '#6366f1';
export const TAILWIND_BLUE_500: string = '#3b82f6';
export const TAILWIND_CYAN_500: string = '#06b6d4';
export const TAILWIND_CYAN_600: string = '#0891b2';
export const TAILWIND_GREEN_600: string = '#16a34a';
export const TAILWIND_LIME_700: string = '#65a30d';
export const TAILWIND_EMERALD_600: string = '#059669';
export const TAILWIND_YELLOW_600: string = '#ca8a04';
export const TAILWIND_PINK_500: string = '#ec4899';
export const TAILWIND_FUCSHIA_500: string = '#d946ef';
export const TAILWIND_RED_500: string = '#fb2c36';
export const POINTS_DARK_GRAY: string = '#4a4a4a';
export const POINTS_GRAY: string = '#888888';

// ============================================================
// Algorithm Colors
// ============================================================

export const ALGO_GENETIC_ALGORITHM: string = TAILWIND_LIME_700;
export const ALGO_PARTICLE_SWARM: string = TAILWIND_EMERALD_600;
export const ALGO_GRADIENT_DESCENT: string = TAILWIND_CYAN_600;
export const ALGO_MOMENTUM_BASED_GD: string = TAILWIND_INDIGO_500;
export const ALGO_ADAM_OPTIMIZER: string = TAILWIND_PURPLE_500;
export const ALGO_SIMULATED_ANNEALING: string = TAILWIND_YELLOW_600;
export const ALGO_POLYNOMIAL_SOLVER: string = TAILWIND_PINK_500;
export const ALGO_RANDOM_SEARCH: string = TAILWIND_FUCSHIA_500;

// ============================================================
// Slider Ranges - Points
// ============================================================

export const MIN_POINTS: number = 1;
export const MAX_POINTS: number = 24;
export const DEFAULT_NUM_POINTS_DESKTOP: number = 5;
export const DEFAULT_NUM_POINTS_MOBILE: number = 5;

// ============================================================
// Slider Ranges - Weights
// ============================================================

export const MIN_WEIGHTS: number = 1;
export const MAX_WEIGHTS: number = 24;
export const DEFAULT_NUM_WEIGHTS_DESKTOP: number = 5;
export const DEFAULT_NUM_WEIGHTS_MOBILE: number = 5;

// ============================================================
// Slider Ranges - Children (Genetic Algorithm)
// ============================================================

export const MIN_CHILDREN: number = 2;
export const MAX_CHILDREN: number = 64;
export const DEFAULT_NUM_CHILDREN_DESKTOP: number = 5;
export const DEFAULT_NUM_CHILDREN_MOBILE: number = 5;

// ============================================================
// Slider Ranges - Speed (Generations/Iterations per Second)
// ============================================================

export const MIN_GENERATIONS_PER_SEC: number = 1;
export const MAX_GENERATIONS_PER_SEC: number = 256;
export const DEFAULT_GENERATIONS_PER_SEC_DESKTOP: number = 60;
export const DEFAULT_GENERATIONS_PER_SEC_MOBILE: number = 60;

// ============================================================
// Slider Ranges - Mutation Variance (Genetic Algorithm)
// ============================================================

export const MIN_MUTATION_VARIANCE: number = 0.01;
export const MAX_MUTATION_VARIANCE: number = 2;
export const DEFAULT_MUTATION_VARIANCE_DESKTOP: number = 1;
export const DEFAULT_MUTATION_VARIANCE_MOBILE: number = 1;

// ============================================================
// Slider Ranges - Weight Penalty (L2 Regularization)
// ============================================================

export const MIN_WEIGHT_PENALTY: number = 0;
export const MAX_WEIGHT_PENALTY: number = 1;
export const DEFAULT_WEIGHT_PENALTY_DESKTOP: number = 0;
export const DEFAULT_WEIGHT_PENALTY_MOBILE: number = 0;

// ============================================================
// Gradient Descent Parameters
// ============================================================

export const MIN_LEARNING_RATE: number = 0.0001;
export const MAX_LEARNING_RATE: number = 1;
export const DEFAULT_LEARNING_RATE_DESKTOP: number = 0.1;
export const DEFAULT_LEARNING_RATE_MOBILE: number = 0.1;

export const MIN_STOCHASTICITY: number = 0;
export const MAX_STOCHASTICITY: number = 3;
export const DEFAULT_STOCHASTICITY_DESKTOP: number = 0;
export const DEFAULT_STOCHASTICITY_MOBILE: number = 0;

// ============================================================
// Adam Optimizer Parameters
// ============================================================

export const MIN_ADAM_LEARNING_RATE: number = 0.0001;
export const MAX_ADAM_LEARNING_RATE: number = 1;
export const DEFAULT_ADAM_LEARNING_RATE_DESKTOP: number = 0.1;
export const DEFAULT_ADAM_LEARNING_RATE_MOBILE: number = 0.1;

export const MIN_ADAM_BETA1: number = 0;
export const MAX_ADAM_BETA1: number = 0.999;
export const DEFAULT_ADAM_BETA1_DESKTOP: number = 0.97;
export const DEFAULT_ADAM_BETA1_MOBILE: number = 0.97;

export const MIN_ADAM_BETA2: number = 0;
export const MAX_ADAM_BETA2: number = 0.9999;
export const DEFAULT_ADAM_BETA2_DESKTOP: number = 0.999;
export const DEFAULT_ADAM_BETA2_MOBILE: number = 0.999;

export const MIN_ADAM_EPSILON: number = 1e-10;
export const MAX_ADAM_EPSILON: number = 1e-6;
export const DEFAULT_ADAM_EPSILON_DESKTOP: number = 1e-8;
export const DEFAULT_ADAM_EPSILON_MOBILE: number = 1e-8;

// ============================================================
// Simulated Annealing Parameters
// ============================================================

export const MIN_SA_INITIAL_TEMP: number = 0.1;
export const MAX_SA_INITIAL_TEMP: number = 10;
export const DEFAULT_SA_INITIAL_TEMP_DESKTOP: number = 1;
export const DEFAULT_SA_INITIAL_TEMP_MOBILE: number = 1;

export const MIN_SA_COOLING_RATE: number = 0.9;
export const MAX_SA_COOLING_RATE: number = 0.9999;
export const DEFAULT_SA_COOLING_RATE_DESKTOP: number = 0.995;
export const DEFAULT_SA_COOLING_RATE_MOBILE: number = 0.995;

export const MIN_SA_ITERATIONS: number = 1;
export const MAX_SA_ITERATIONS: number = 100;
export const DEFAULT_SA_ITERATIONS_DESKTOP: number = 10;
export const DEFAULT_SA_ITERATIONS_MOBILE: number = 10;

// ============================================================
// Particle Swarm Parameters
// ============================================================

export const MIN_PS_PARTICLES: number = 2;
export const MAX_PS_PARTICLES: number = 64;
export const DEFAULT_PS_PARTICLES_DESKTOP: number = 20;
export const DEFAULT_PS_PARTICLES_MOBILE: number = 20;

export const MIN_PS_INERTIA: number = 0;
export const MAX_PS_INERTIA: number = 1;
export const DEFAULT_PS_INERTIA_DESKTOP: number = 0.7;
export const DEFAULT_PS_INERTIA_MOBILE: number = 0.7;

export const MIN_PS_COGNITIVE: number = 0;
export const MAX_PS_COGNITIVE: number = 4;
export const DEFAULT_PS_COGNITIVE_DESKTOP: number = 1.5;
export const DEFAULT_PS_COGNITIVE_MOBILE: number = 1.5;

export const MIN_PS_SOCIAL: number = 0;
export const MAX_PS_SOCIAL: number = 4;
export const DEFAULT_PS_SOCIAL_DESKTOP: number = 1.5;
export const DEFAULT_PS_SOCIAL_MOBILE: number = 1.5;

// ============================================================
// Momentum-Based Gradient Descent Parameters
// ============================================================

export const MIN_MOMENTUM_LEARNING_RATE: number = 0.0001;
export const MAX_MOMENTUM_LEARNING_RATE: number = 1;
export const DEFAULT_MOMENTUM_LEARNING_RATE_DESKTOP: number = 0.1;
export const DEFAULT_MOMENTUM_LEARNING_RATE_MOBILE: number = 0.1;

export const MIN_MOMENTUM_BETA: number = 0;
export const MAX_MOMENTUM_BETA: number = 0.999;
export const DEFAULT_MOMENTUM_BETA_DESKTOP: number = 0.9;
export const DEFAULT_MOMENTUM_BETA_MOBILE: number = 0.9;

// ============================================================
// Random Search Parameters
// ============================================================

export const MIN_RS_CURVES: number = 2;
export const MAX_RS_CURVES: number = 64;
export const DEFAULT_RS_CURVES_DESKTOP: number = 10;
export const DEFAULT_RS_CURVES_MOBILE: number = 10;

// ============================================================
// Point and Curve Generation
// ============================================================

export const POINT_RADIUS: number = 8;

// ============================================================
// Drawing Styles - Dots/Points
// ============================================================

export const DOT_BORDER_COLOR: string = '#ffffff';
export const DOT_BORDER_WIDTH: number = 3;

// ============================================================
// Drawing Styles - Curves
// ============================================================

export const BEST_CURVE_LINE_WIDTH: number = 5;
export const OTHER_CURVE_LINE_WIDTH: number = 2;
export const OTHER_CURVE_COLOR: string = '#666666';
export const OTHER_CURVE_OPACITY: number = 0.5;

// ============================================================
// Genetic Algorithm / Mutation Configuration
// ============================================================

export const MUTATION_DISTRIBUTION_TYPE: 'normal' | 'uniform' = 'normal';
export const MUTATION_MIN_VARIANCE: number = 0.0;
export const MUTATION_VARIANCE_EXPONENT: number = 1;
export const MUTATION_WEIGHT_VARIANCE_SCALES: number[] = [1.0];

// Adaptive Variance (based on loss)
export const ADAPTIVE_VARIANCE_ENABLED: boolean = true;
export const ADAPTIVE_VARIANCE_MIN_SCALE: number = 0.01;
export const ADAPTIVE_VARIANCE_MAX_SCALE: number = 1.0;
export const ADAPTIVE_VARIANCE_LOSS_TARGET: number = 0.1;

// Weight-Proportional Variance (variance scales with weight magnitude)
export const WEIGHT_PROPORTIONAL_VARIANCE_ENABLED: boolean = true;
export const WEIGHT_PROPORTIONAL_VARIANCE_FACTOR: number = 0.5;
export const WEIGHT_PROPORTIONAL_VARIANCE_MIN: number = 0.1;

// ============================================================
// Coordinate System
// ============================================================

export const COORD_MIN: number = -1;
export const COORD_MAX: number = 1;
export const CURVE_HORIZONTAL_OVERDRAW: number = 1.0;

// ============================================================
// Canvas Dimensions and Scaling
// ============================================================

export const CANVAS_SCALE: number = 2;
export const PADDING: number = 25;
export const MIN_CANVAS_SIZE: number = 350;
export const MIN_CANVAS_SIZE_MOBILE: number = 280;
export const VIEWPORT_HEIGHT_OFFSET: number = 60;
export const VIEWPORT_HEIGHT_OFFSET_MOBILE: number = 450;
export const VIEWPORT_WIDTH_OFFSET: number = 660;
export const VIEWPORT_WIDTH_OFFSET_MOBILE: number = 40;
export const MOBILE_BREAKPOINT: number = 768;

// ============================================================
// Curve Drawing Resolution
// ============================================================

export const PRIMARY_CURVE_RESOLUTION: number = 300;
export const AUXILIARY_CURVE_RESOLUTION: number = 80;

// ============================================================
// Drawing Styles - Error Bars, Grid, and Axes
// ============================================================

export const ERROR_BAR_LINE_WIDTH: number = 3;
export const GRID_LINE_WIDTH: number = 1;
export const AXIS_LINE_WIDTH: number = 2;

// ============================================================
// Canvas Colors
// ============================================================

export const COLOR_ERROR_BARS: string = TAILWIND_RED_500;
export const COLOR_POINT_BORDER: string = DOT_BORDER_COLOR;
export const COLOR_BACKGROUND: string = '#1a1a1a';
export const COLOR_GRID: string = '#333';
export const COLOR_AXES: string = '#666';
export const COLOR_LABELS: string = '#aaa';

// ============================================================
// Algorithm Order
// ============================================================

export const ALGORITHM_ORDER: SolutionMethod[] = [
  'gradient',
  'momentum',
  'adam',
  'genetic',
  'particle-swarm',
  'simulated-annealing',
  'random-search',
  'polynomial-solver',
];

// ============================================================
// Algorithm Information
// ============================================================

export const ALGORITHMS: AlgorithmInfo[] = [
  { id: 'gradient', name: 'Stochastic', fullName: 'Stochastic Gradient Descent', category: 'Gradient Descent', color: ALGO_GRADIENT_DESCENT },
  { id: 'momentum', name: 'Momentum', fullName: 'Momentum-Based Gradient Descent', category: 'Gradient Descent', color: ALGO_MOMENTUM_BASED_GD },
  { id: 'adam', name: 'Adam', fullName: 'Adam Optimizer', category: 'Gradient Descent', color: ALGO_ADAM_OPTIMIZER },
  { id: 'genetic', name: 'Genetic', fullName: 'Genetic Algorithm', category: 'Evolutionary', color: ALGO_GENETIC_ALGORITHM },
  { id: 'particle-swarm', name: 'Particle', fullName: 'Particle Swarm Optimization', category: 'Swarm Intelligence', color: ALGO_PARTICLE_SWARM },
  { id: 'random-search', name: 'Random', fullName: 'Random Search', category: 'Baseline', color: ALGO_RANDOM_SEARCH },
  { id: 'simulated-annealing', name: 'Annealing', fullName: 'Simulated Annealing', category: 'Metaheuristic', color: ALGO_SIMULATED_ANNEALING },
  { id: 'polynomial-solver', name: 'Solve', fullName: 'Exact Polynomial Solver', category: 'Baseline', color: ALGO_POLYNOMIAL_SOLVER },
];

// ============================================================
// Utility Functions
// ============================================================

export const isMobile = (): boolean => window.innerWidth < MOBILE_BREAKPOINT;

export const getAlgoInfo = (solutionMethod: SolutionMethod): AlgorithmInfo => {
  const info = ALGORITHMS.find(algo => algo.id === solutionMethod);
  if (!info) {
    throw new Error(`Unknown solution method: ${solutionMethod}`);
  }
  return info;
};

export const getAlgoColor = (solutionMethod: SolutionMethod): string => {
  return getAlgoInfo(solutionMethod).color;
};
