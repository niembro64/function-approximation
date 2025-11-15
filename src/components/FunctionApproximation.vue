<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue';
import Slider from './Slider.vue';
import WeightCell from './WeightCell.vue';
import InfoModal from './InfoModal.vue';
import { generateScientificNotation } from '../utils/formatters';

interface Point {
  x: number;
  y: number;
}

interface Curve {
  id: number;
  weights: number[]; // Dynamic array of weights [w0, w1, w2, ...]
  fitness: number;
}

interface CanvasCoords {
  cx: number;
  cy: number;
}

interface CoordSystemCoords {
  x: number;
  y: number;
}

interface SliderConfig {
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

// ============================================================
// Configuration
// ============================================================

const TAILWIND_PURPLE_500: string = '#a855f7';
const TAILWIND_VIOLET_500: string = '#8b5cf6';
const TAILWIND_INDIGO_500: string = '#6366f1';
const TAILWIND_BLUE_500: string = '#3b82f6';
const TAILWIND_CYAN_500: string = '#06b6d4';
const TAILWIND_GREEN_600: string = '#16a34a';
const TAILWIND_LIME_700: string = '#65a30d';
const TAILWIND_EMERALD_600: string = '#059669';
const TAILWIND_YELLOW_600: string = '#ca8a04';
const TAILWIND_PINK_500: string = '#ec4899';
const TAILWIND_RED_500: string = '#fb2c36';
const POINTS_DARK_GRAY: string = '#4a4a4a'; // Dark gray for points/data
const POINTS_GRAY: string = '#888888'; // Gray for points/data

const ALGO_GENETIC_ALGORITHM: string = TAILWIND_LIME_700;
const ALGO_PARTICLE_SWARM: string = TAILWIND_EMERALD_600;
const ALGO_GRADIENT_DESCENT: string = TAILWIND_BLUE_500;
const ALGO_MOMENTUM_BASED_GD: string = TAILWIND_INDIGO_500;
const ALGO_ADAM_OPTIMIZER: string = TAILWIND_VIOLET_500;
const ALGO_SIMULATED_ANNEALING: string = TAILWIND_YELLOW_600;
const ALGO_POLYNOMIAL_SOLVER: string = TAILWIND_PINK_500;

// Slider Ranges
const MIN_POINTS: number = 1;
const MAX_POINTS: number = 24;
const DEFAULT_NUM_POINTS_DESKTOP: number = 5;
const DEFAULT_NUM_POINTS_MOBILE: number = 5;

const MIN_WEIGHTS: number = 1;
const MAX_WEIGHTS: number = 24;
const DEFAULT_NUM_WEIGHTS_DESKTOP: number = 5;
const DEFAULT_NUM_WEIGHTS_MOBILE: number = 5;

const MIN_CHILDREN: number = 2;
const MAX_CHILDREN: number = 64;
const DEFAULT_NUM_CHILDREN_DESKTOP: number = 5;
const DEFAULT_NUM_CHILDREN_MOBILE: number = 5;

const MIN_GENERATIONS_PER_SEC: number = 1;
const MAX_GENERATIONS_PER_SEC: number = 256;
const DEFAULT_GENERATIONS_PER_SEC_DESKTOP: number = 60;
const DEFAULT_GENERATIONS_PER_SEC_MOBILE: number = 60;

const MIN_MUTATION_VARIANCE: number = 0.01;
const MAX_MUTATION_VARIANCE: number = 2;
const DEFAULT_MUTATION_VARIANCE_DESKTOP: number = 1;
const DEFAULT_MUTATION_VARIANCE_MOBILE: number = 1;

const MIN_WEIGHT_PENALTY: number = 0;
const MAX_WEIGHT_PENALTY: number = 1;
const DEFAULT_WEIGHT_PENALTY_DESKTOP: number = 0;
const DEFAULT_WEIGHT_PENALTY_MOBILE: number = 0;

// Gradient Descent Parameters
const MIN_LEARNING_RATE: number = 0.0001;
const MAX_LEARNING_RATE: number = 1;
const DEFAULT_LEARNING_RATE_DESKTOP: number = 0.1;
const DEFAULT_LEARNING_RATE_MOBILE: number = 0.1;

const MIN_STOCHASTICITY: number = 0;
const MAX_STOCHASTICITY: number = 3;
const DEFAULT_STOCHASTICITY_DESKTOP: number = 0;
const DEFAULT_STOCHASTICITY_MOBILE: number = 0;

// Adam Optimizer Parameters
const MIN_ADAM_LEARNING_RATE: number = 0.0001;
const MAX_ADAM_LEARNING_RATE: number = 1;
const DEFAULT_ADAM_LEARNING_RATE_DESKTOP: number = 0.1;
const DEFAULT_ADAM_LEARNING_RATE_MOBILE: number = 0.1;

const MIN_ADAM_BETA1: number = 0;
const MAX_ADAM_BETA1: number = 0.999;
const DEFAULT_ADAM_BETA1_DESKTOP: number = 0.97;
const DEFAULT_ADAM_BETA1_MOBILE: number = 0.97;

const MIN_ADAM_BETA2: number = 0;
const MAX_ADAM_BETA2: number = 0.9999;
const DEFAULT_ADAM_BETA2_DESKTOP: number = 0.999;
const DEFAULT_ADAM_BETA2_MOBILE: number = 0.999;

const MIN_ADAM_EPSILON: number = 1e-10;
const MAX_ADAM_EPSILON: number = 1e-6;
const DEFAULT_ADAM_EPSILON_DESKTOP: number = 1e-8;
const DEFAULT_ADAM_EPSILON_MOBILE: number = 1e-8;

// Simulated Annealing Parameters
const MIN_SA_INITIAL_TEMP: number = 0.1;
const MAX_SA_INITIAL_TEMP: number = 10;
const DEFAULT_SA_INITIAL_TEMP_DESKTOP: number = 1;
const DEFAULT_SA_INITIAL_TEMP_MOBILE: number = 1;

const MIN_SA_COOLING_RATE: number = 0.9;
const MAX_SA_COOLING_RATE: number = 0.9999;
const DEFAULT_SA_COOLING_RATE_DESKTOP: number = 0.995;
const DEFAULT_SA_COOLING_RATE_MOBILE: number = 0.995;

const MIN_SA_ITERATIONS: number = 1;
const MAX_SA_ITERATIONS: number = 100;
const DEFAULT_SA_ITERATIONS_DESKTOP: number = 10;
const DEFAULT_SA_ITERATIONS_MOBILE: number = 10;

// Particle Swarm Parameters
const MIN_PS_PARTICLES: number = 2;
const MAX_PS_PARTICLES: number = 64;
const DEFAULT_PS_PARTICLES_DESKTOP: number = 20;
const DEFAULT_PS_PARTICLES_MOBILE: number = 20;

const MIN_PS_INERTIA: number = 0;
const MAX_PS_INERTIA: number = 1;
const DEFAULT_PS_INERTIA_DESKTOP: number = 0.7;
const DEFAULT_PS_INERTIA_MOBILE: number = 0.7;

const MIN_PS_COGNITIVE: number = 0;
const MAX_PS_COGNITIVE: number = 4;
const DEFAULT_PS_COGNITIVE_DESKTOP: number = 1.5;
const DEFAULT_PS_COGNITIVE_MOBILE: number = 1.5;

const MIN_PS_SOCIAL: number = 0;
const MAX_PS_SOCIAL: number = 4;
const DEFAULT_PS_SOCIAL_DESKTOP: number = 1.5;
const DEFAULT_PS_SOCIAL_MOBILE: number = 1.5;

// Momentum-Based GD Parameters
const MIN_MOMENTUM_LEARNING_RATE: number = 0.0001;
const MAX_MOMENTUM_LEARNING_RATE: number = 1;
const DEFAULT_MOMENTUM_LEARNING_RATE_DESKTOP: number = 0.1;
const DEFAULT_MOMENTUM_LEARNING_RATE_MOBILE: number = 0.1;

const MIN_MOMENTUM_BETA: number = 0;
const MAX_MOMENTUM_BETA: number = 0.999;
const DEFAULT_MOMENTUM_BETA_DESKTOP: number = 0.9;
const DEFAULT_MOMENTUM_BETA_MOBILE: number = 0.9;

// Point and Curve Generation
const POINT_RADIUS: number = 8; // Size of data points on canvas

// Dot/Point Colors (for canvas points and slider thumbs) - dynamic based on method
const getAlgoColor = (): string => {
  switch (solutionMethod.value) {
    case 'genetic':
      return ALGO_GENETIC_ALGORITHM;
    case 'gradient':
      return ALGO_GRADIENT_DESCENT;
    case 'adam':
      return ALGO_ADAM_OPTIMIZER;
    case 'simulated-annealing':
      return ALGO_SIMULATED_ANNEALING;
    case 'particle-swarm':
      return ALGO_PARTICLE_SWARM;
    case 'momentum':
      return ALGO_MOMENTUM_BASED_GD;
    case 'polynomial-solver':
      return ALGO_POLYNOMIAL_SOLVER;
    default:
      throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }
};
const DOT_BORDER_COLOR: string = '#ffffff';
const DOT_BORDER_WIDTH: number = 3;

// Curve Drawing Styles - dynamic based on method
const BEST_CURVE_LINE_WIDTH: number = 5;

const OTHER_CURVE_LINE_WIDTH: number = 2;
const OTHER_CURVE_COLOR: string = '#666666'; // Gray
const OTHER_CURVE_OPACITY: number = 0.5;

// Genetic Algorithm / Mutation
type MutationDistribution = 'normal' | 'uniform';
const MUTATION_DISTRIBUTION_TYPE = 'normal' satisfies MutationDistribution; // Distribution type: 'normal' (Gaussian) or 'uniform'
const MUTATION_MIN_VARIANCE: number = 0.0; // Minimum variance (for index 0)
const MUTATION_VARIANCE_EXPONENT: number = 1; // Variance curve exponent (1 = linear, 2 = quadratic, etc.)
const MUTATION_WEIGHT_VARIANCE_SCALES: number[] = [1.0]; // Variance multiplier per weight (if empty, uses 1.0 for all)

// Adaptive Variance (based on fitness)
const ADAPTIVE_VARIANCE_ENABLED: boolean = true;
const ADAPTIVE_VARIANCE_MIN_SCALE: number = 0.01; // Minimum variance scale (when fitness is very low/good)
const ADAPTIVE_VARIANCE_MAX_SCALE: number = 1.0; // Maximum variance scale (when fitness is high/bad)
const ADAPTIVE_VARIANCE_FITNESS_TARGET: number = 0.1; // Fitness value that gives ~50% scale

// Weight-Proportional Variance (variance scales with weight magnitude)
const WEIGHT_PROPORTIONAL_VARIANCE_ENABLED: boolean = true;
const WEIGHT_PROPORTIONAL_VARIANCE_FACTOR: number = 0.5; // How much to scale variance based on weight magnitude
const WEIGHT_PROPORTIONAL_VARIANCE_MIN: number = 0.1; // Minimum variance multiplier (for weights near 0)

// Coordinate System
const COORD_MIN: number = -1;
const COORD_MAX: number = 1;
const CURVE_HORIZONTAL_OVERDRAW: number = 1.0; // Extend curve drawing beyond visible area (draws from -2 to 2)

// Canvas Dimensions
const CANVAS_SIZE = ref<number>(500);
const CANVAS_SCALE: number = 2; // Render at 2x resolution for crisp display
const PADDING: number = 40;
const MIN_CANVAS_SIZE: number = 350;
const MIN_CANVAS_SIZE_MOBILE: number = 280;
const VIEWPORT_HEIGHT_OFFSET: number = 60;
const VIEWPORT_HEIGHT_OFFSET_MOBILE: number = 450; // More offset on mobile for stacked layout
const VIEWPORT_WIDTH_OFFSET: number = 660; // Increased for wider left panel
const VIEWPORT_WIDTH_OFFSET_MOBILE: number = 40; // Minimal offset on mobile
const MOBILE_BREAKPOINT: number = 768; // px

// Curve Drawing Resolution
const PRIMARY_CURVE_RESOLUTION: number = 300; // Number of points for best curve (higher = smoother)
const AUXILIARY_CURVE_RESOLUTION: number = 50; // Number of points for auxiliary curves (genetic children, particle swarm particles)

// Error Bars
const ERROR_BAR_LINE_WIDTH: number = 3;

// Grid and Axes
const GRID_LINE_WIDTH: number = 1;
const AXIS_LINE_WIDTH: number = 2;

// Canvas Colors
const COLOR_ERROR_BARS: string = TAILWIND_RED_500;
const COLOR_POINT_BORDER: string = DOT_BORDER_COLOR;
const COLOR_BACKGROUND: string = '#1a1a1a'; // Dark gray
const COLOR_GRID: string = '#333'; // Dark gray
const COLOR_AXES: string = '#666'; // Gray
const COLOR_LABELS: string = '#aaa'; // Light gray

// Determine if mobile based on initial viewport width
const isMobile = (): boolean => window.innerWidth < MOBILE_BREAKPOINT;

// Reactive state
const canvasRef = ref<HTMLCanvasElement | null>(null);
const allPoints = ref<Point[]>([]); // Full set of points (up to MAX_POINTS)
const curves = ref<Curve[]>([]);
const numPoints = ref<number>(
  isMobile() ? DEFAULT_NUM_POINTS_MOBILE : DEFAULT_NUM_POINTS_DESKTOP
);
const numWeights = ref<number>(
  isMobile() ? DEFAULT_NUM_WEIGHTS_MOBILE : DEFAULT_NUM_WEIGHTS_DESKTOP
);
const numChildren = ref<number>(
  isMobile() ? DEFAULT_NUM_CHILDREN_MOBILE : DEFAULT_NUM_CHILDREN_DESKTOP
);
const generationsPerSec = ref<number>(
  isMobile()
    ? DEFAULT_GENERATIONS_PER_SEC_MOBILE
    : DEFAULT_GENERATIONS_PER_SEC_DESKTOP
);
const mutationVariance = ref<number>(
  isMobile()
    ? DEFAULT_MUTATION_VARIANCE_MOBILE
    : DEFAULT_MUTATION_VARIANCE_DESKTOP
);
const weightPenalty = ref<number>(
  isMobile() ? DEFAULT_WEIGHT_PENALTY_MOBILE : DEFAULT_WEIGHT_PENALTY_DESKTOP
);
const learningRate = ref<number>(
  isMobile() ? DEFAULT_LEARNING_RATE_MOBILE : DEFAULT_LEARNING_RATE_DESKTOP
);
const stochasticity = ref<number>(
  isMobile() ? DEFAULT_STOCHASTICITY_MOBILE : DEFAULT_STOCHASTICITY_DESKTOP
);
const adamLearningRate = ref<number>(
  isMobile()
    ? DEFAULT_ADAM_LEARNING_RATE_MOBILE
    : DEFAULT_ADAM_LEARNING_RATE_DESKTOP
);
const adamBeta1 = ref<number>(
  isMobile() ? DEFAULT_ADAM_BETA1_MOBILE : DEFAULT_ADAM_BETA1_DESKTOP
);
const adamBeta2 = ref<number>(
  isMobile() ? DEFAULT_ADAM_BETA2_MOBILE : DEFAULT_ADAM_BETA2_DESKTOP
);
const adamEpsilon = ref<number>(
  isMobile() ? DEFAULT_ADAM_EPSILON_MOBILE : DEFAULT_ADAM_EPSILON_DESKTOP
);
const saInitialTemp = ref<number>(
  isMobile() ? DEFAULT_SA_INITIAL_TEMP_MOBILE : DEFAULT_SA_INITIAL_TEMP_DESKTOP
);
const saCoolingRate = ref<number>(
  isMobile() ? DEFAULT_SA_COOLING_RATE_MOBILE : DEFAULT_SA_COOLING_RATE_DESKTOP
);
const saIterations = ref<number>(
  isMobile() ? DEFAULT_SA_ITERATIONS_MOBILE : DEFAULT_SA_ITERATIONS_DESKTOP
);
const psParticles = ref<number>(
  isMobile() ? DEFAULT_PS_PARTICLES_MOBILE : DEFAULT_PS_PARTICLES_DESKTOP
);
const psInertia = ref<number>(
  isMobile() ? DEFAULT_PS_INERTIA_MOBILE : DEFAULT_PS_INERTIA_DESKTOP
);
const psCognitive = ref<number>(
  isMobile() ? DEFAULT_PS_COGNITIVE_MOBILE : DEFAULT_PS_COGNITIVE_DESKTOP
);
const psSocial = ref<number>(
  isMobile() ? DEFAULT_PS_SOCIAL_MOBILE : DEFAULT_PS_SOCIAL_DESKTOP
);
const momentumLearningRate = ref<number>(
  isMobile()
    ? DEFAULT_MOMENTUM_LEARNING_RATE_MOBILE
    : DEFAULT_MOMENTUM_LEARNING_RATE_DESKTOP
);
const momentumBeta = ref<number>(
  isMobile() ? DEFAULT_MOMENTUM_BETA_MOBILE : DEFAULT_MOMENTUM_BETA_DESKTOP
);
let animationFrameId: number | null = null;
let lastFrameTime: number = 0;
let generationAccumulator: number = 0;

// Adam optimizer state (moment estimates)
const adamM = ref<number[]>([]); // First moment (mean)
const adamV = ref<number[]>([]); // Second moment (variance)
const adamT = ref<number>(0); // Time step

// Simulated Annealing state
const saTemperature = ref<number>(saInitialTemp.value);
const saCurrentBest = ref<number[] | null>(null);
const saBestFitness = ref<number>(Infinity);

// Particle Swarm state
interface Particle {
  weights: number[];
  velocity: number[];
  bestWeights: number[];
  bestFitness: number;
}
const psParticlesState = ref<Particle[]>([]);
const psGlobalBestWeights = ref<number[]>([]);
const psGlobalBestFitness = ref<number>(Infinity);

// Momentum state
const momentumV = ref<number[]>([]); // Velocity

// Common slider configurations for both methods
const commonSliderConfigs: SliderConfig[] = [
  {
    label: '# Points',
    model: numPoints,
    min: MIN_POINTS,
    max: MAX_POINTS,
  },
  {
    label: '# Weights',
    model: numWeights,
    min: MIN_WEIGHTS,
    max: MAX_WEIGHTS,
  },
];

// Speed slider - different models for each method
const speedSliderConfig = computed((): SliderConfig => {
  return {
    label: 'Speed',
    model: generationsPerSec,
    min: MIN_GENERATIONS_PER_SEC,
    max: MAX_GENERATIONS_PER_SEC,
  };
});

// Weight Penalty slider - common configuration
const weightPenaltySliderConfig: SliderConfig = {
  label: '↑ Weight Penalty',
  model: weightPenalty,
  min: MIN_WEIGHT_PENALTY,
  max: MAX_WEIGHT_PENALTY,
  step: 0.01,
  decimals: 2,
  logarithmic: true,
  logMidpoint: 0.01,
  useScientificNotation: true,
};

// Genetic Algorithm specific sliders
const geneticSpecificSliders: SliderConfig[] = [
  {
    label: '# Children',
    model: numChildren,
    min: MIN_CHILDREN,
    max: MAX_CHILDREN,
  },
  {
    label: 'Mutation Variance',
    model: mutationVariance,
    min: MIN_MUTATION_VARIANCE,
    max: MAX_MUTATION_VARIANCE,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
];

// Gradient Descent specific sliders
const gradientSpecificSliders: SliderConfig[] = [
  {
    label: 'Learning Rate',
    model: learningRate,
    min: MIN_LEARNING_RATE,
    max: MAX_LEARNING_RATE,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Stochasticity',
    model: stochasticity,
    min: MIN_STOCHASTICITY,
    max: MAX_STOCHASTICITY,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
];

// Adam Optimizer specific sliders
const adamSpecificSliders: SliderConfig[] = [
  {
    label: 'Learning Rate',
    model: adamLearningRate,
    min: MIN_ADAM_LEARNING_RATE,
    max: MAX_ADAM_LEARNING_RATE,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Beta1 (Momentum)',
    model: adamBeta1,
    min: MIN_ADAM_BETA1,
    max: MAX_ADAM_BETA1,
    step: 0.001,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Beta2 (RMSProp)',
    model: adamBeta2,
    min: MIN_ADAM_BETA2,
    max: MAX_ADAM_BETA2,
    step: 0.0001,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Epsilon',
    model: adamEpsilon,
    min: MIN_ADAM_EPSILON,
    max: MAX_ADAM_EPSILON,
    step: 1e-10,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 1e-8,
    useScientificNotation: true,
  },
];

// Simulated Annealing specific sliders
const saSpecificSliders: SliderConfig[] = [
  {
    label: 'Initial Temp',
    model: saInitialTemp,
    min: MIN_SA_INITIAL_TEMP,
    max: MAX_SA_INITIAL_TEMP,
    step: 0.1,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Cooling Rate',
    model: saCoolingRate,
    min: MIN_SA_COOLING_RATE,
    max: MAX_SA_COOLING_RATE,
    step: 0.0001,
    decimals: 4,
    useScientificNotation: true,
  },
  {
    label: 'Iterations/Temp',
    model: saIterations,
    min: MIN_SA_ITERATIONS,
    max: MAX_SA_ITERATIONS,
  },
];

// Particle Swarm specific sliders
const psSpecificSliders: SliderConfig[] = [
  {
    label: '# Particles',
    model: psParticles,
    min: MIN_PS_PARTICLES,
    max: MAX_PS_PARTICLES,
  },
  {
    label: 'Inertia',
    model: psInertia,
    min: MIN_PS_INERTIA,
    max: MAX_PS_INERTIA,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Cognitive',
    model: psCognitive,
    min: MIN_PS_COGNITIVE,
    max: MAX_PS_COGNITIVE,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Social',
    model: psSocial,
    min: MIN_PS_SOCIAL,
    max: MAX_PS_SOCIAL,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
];

// Momentum-Based GD specific sliders
const momentumSpecificSliders: SliderConfig[] = [
  {
    label: 'Learning Rate',
    model: momentumLearningRate,
    min: MIN_MOMENTUM_LEARNING_RATE,
    max: MAX_MOMENTUM_LEARNING_RATE,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Momentum (Beta)',
    model: momentumBeta,
    min: MIN_MOMENTUM_BETA,
    max: MAX_MOMENTUM_BETA,
    step: 0.001,
    decimals: 2,
    useScientificNotation: true,
  },
];

// Computed slider configs based on solution method
const sliderConfigs = computed((): SliderConfig[] => {
  switch (solutionMethod.value) {
    case 'genetic':
      // Genetic: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...geneticSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'gradient':
      // Gradient: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...gradientSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'adam':
      // Adam: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...adamSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'simulated-annealing':
      // Simulated Annealing: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...saSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'particle-swarm':
      // Particle Swarm: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...psSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'momentum':
      // Momentum: common sliders first, then specific sliders, then speed/penalty
      return [
        ...commonSliderConfigs,
        ...momentumSpecificSliders,
        speedSliderConfig.value,
        weightPenaltySliderConfig,
      ];
    case 'polynomial-solver':
      // Polynomial Solver: only common sliders (no optimization parameters needed)
      return [...commonSliderConfigs];
    default:
      throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }
});

// Drag state
const draggingPointIndex = ref<number | null>(null);
const hoveredPointIndex = ref<number | null>(null);

// Modal state
const isInfoModalOpen = ref<boolean>(false);

const openInfoModal = (): void => {
  isInfoModalOpen.value = true;
};

const closeInfoModal = (): void => {
  isInfoModalOpen.value = false;
};

// Solution method state
type SolutionMethod =
  | 'genetic'
  | 'gradient'
  | 'adam'
  | 'simulated-annealing'
  | 'particle-swarm'
  | 'momentum'
  | 'polynomial-solver';
// Algorithm order when clicking through
const ALGORITHM_ORDER: SolutionMethod[] = [
  'genetic',
  'particle-swarm',
  'gradient',
  'momentum',
  'adam',
  'simulated-annealing',
  'polynomial-solver',
];

const solutionMethod = ref<SolutionMethod>('genetic');

const toggleSolutionMethod = (): void => {
  // Find current index in the order array
  const currentIndex = ALGORITHM_ORDER.indexOf(solutionMethod.value);
  if (currentIndex === -1) {
    throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }

  // Move to next algorithm (wrap around to start if at end)
  const nextIndex = (currentIndex + 1) % ALGORITHM_ORDER.length;
  solutionMethod.value = ALGORITHM_ORDER[nextIndex];

  stopEvolution();
  resetCurrentAlgorithm();
  startEvolution();
};

// Computed: Get the first N points from allPoints based on slider
const points = computed((): Point[] => {
  return allPoints.value.slice(0, numPoints.value);
});

// Generate random points in coordinate system (generates full set up to MAX_POINTS)
const generateRandomPoints = (): void => {
  const range: number = COORD_MAX - COORD_MIN;
  allPoints.value = Array.from(
    { length: MAX_POINTS },
    (): Point => ({
      x: Math.random() * range + COORD_MIN,
      y: Math.random() * range + COORD_MIN,
    })
  );
  updateFitness();
};

// Generate random weight (starts at 0)
const randomWeight = (): number => 0;

// Generate curves with random weights
const generateCurves = (): void => {
  curves.value = Array.from(
    { length: numChildren.value },
    (_value: unknown, i: number): Curve => ({
      id: i,
      weights: Array.from({ length: numWeights.value }, (): number =>
        randomWeight()
      ),
      fitness: 0,
    })
  );
  updateFitness();
};

// Generate single curve for gradient descent
const generateSingleCurve = (): void => {
  curves.value = [
    {
      id: 0,
      weights: Array.from({ length: numWeights.value }, (): number =>
        randomWeight()
      ),
      fitness: 0,
    },
  ];
  updateFitness();
};

// Reset functions for each algorithm
const resetGeneticAlgorithm = (): void => {
  generateCurves();
};

const resetGradientDescent = (): void => {
  generateSingleCurve();
};

const resetAdamOptimizer = (): void => {
  adamM.value = [];
  adamV.value = [];
  adamT.value = 0;
  generateSingleCurve();
};

const resetSimulatedAnnealing = (): void => {
  saTemperature.value = saInitialTemp.value;
  saCurrentBest.value = null;
  saBestFitness.value = Infinity;
  generateSingleCurve();
};

const resetParticleSwarm = (): void => {
  psParticlesState.value = [];
  psGlobalBestWeights.value = [];
  psGlobalBestFitness.value = Infinity;
  initializeParticleSwarm();
};

const resetMomentumGD = (): void => {
  momentumV.value = [];
  generateSingleCurve();
};

const resetPolynomialSolver = (): void => {
  generateSingleCurve();
  // Solve immediately instead of waiting for animation loop
  solvePolynomialExact();
};

// Reset current algorithm
const resetCurrentAlgorithm = (): void => {
  switch (solutionMethod.value) {
    case 'genetic':
      resetGeneticAlgorithm();
      break;
    case 'gradient':
      resetGradientDescent();
      break;
    case 'adam':
      resetAdamOptimizer();
      break;
    case 'simulated-annealing':
      resetSimulatedAnnealing();
      break;
    case 'particle-swarm':
      resetParticleSwarm();
      break;
    case 'momentum':
      resetMomentumGD();
      break;
    case 'polynomial-solver':
      resetPolynomialSolver();
      break;
    default:
      throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }
};

// Reset all parameters to their defaults
const resetParameters = (): void => {
  const mobile = isMobile();

  // Common parameters
  numPoints.value = mobile
    ? DEFAULT_NUM_POINTS_MOBILE
    : DEFAULT_NUM_POINTS_DESKTOP;
  numWeights.value = mobile
    ? DEFAULT_NUM_WEIGHTS_MOBILE
    : DEFAULT_NUM_WEIGHTS_DESKTOP;
  generationsPerSec.value = mobile
    ? DEFAULT_GENERATIONS_PER_SEC_MOBILE
    : DEFAULT_GENERATIONS_PER_SEC_DESKTOP;
  weightPenalty.value = mobile
    ? DEFAULT_WEIGHT_PENALTY_MOBILE
    : DEFAULT_WEIGHT_PENALTY_DESKTOP;

  // Genetic Algorithm parameters
  numChildren.value = mobile
    ? DEFAULT_NUM_CHILDREN_MOBILE
    : DEFAULT_NUM_CHILDREN_DESKTOP;
  mutationVariance.value = mobile
    ? DEFAULT_MUTATION_VARIANCE_MOBILE
    : DEFAULT_MUTATION_VARIANCE_DESKTOP;

  // Gradient Descent parameters
  learningRate.value = mobile
    ? DEFAULT_LEARNING_RATE_MOBILE
    : DEFAULT_LEARNING_RATE_DESKTOP;
  stochasticity.value = mobile
    ? DEFAULT_STOCHASTICITY_MOBILE
    : DEFAULT_STOCHASTICITY_DESKTOP;

  // Adam Optimizer parameters
  adamLearningRate.value = mobile
    ? DEFAULT_ADAM_LEARNING_RATE_MOBILE
    : DEFAULT_ADAM_LEARNING_RATE_DESKTOP;
  adamBeta1.value = mobile
    ? DEFAULT_ADAM_BETA1_MOBILE
    : DEFAULT_ADAM_BETA1_DESKTOP;
  adamBeta2.value = mobile
    ? DEFAULT_ADAM_BETA2_MOBILE
    : DEFAULT_ADAM_BETA2_DESKTOP;
  adamEpsilon.value = mobile
    ? DEFAULT_ADAM_EPSILON_MOBILE
    : DEFAULT_ADAM_EPSILON_DESKTOP;

  // Simulated Annealing parameters
  saInitialTemp.value = mobile
    ? DEFAULT_SA_INITIAL_TEMP_MOBILE
    : DEFAULT_SA_INITIAL_TEMP_DESKTOP;
  saCoolingRate.value = mobile
    ? DEFAULT_SA_COOLING_RATE_MOBILE
    : DEFAULT_SA_COOLING_RATE_DESKTOP;
  saIterations.value = mobile
    ? DEFAULT_SA_ITERATIONS_MOBILE
    : DEFAULT_SA_ITERATIONS_DESKTOP;

  // Particle Swarm parameters
  psParticles.value = mobile
    ? DEFAULT_PS_PARTICLES_MOBILE
    : DEFAULT_PS_PARTICLES_DESKTOP;
  psInertia.value = mobile
    ? DEFAULT_PS_INERTIA_MOBILE
    : DEFAULT_PS_INERTIA_DESKTOP;
  psCognitive.value = mobile
    ? DEFAULT_PS_COGNITIVE_MOBILE
    : DEFAULT_PS_COGNITIVE_DESKTOP;
  psSocial.value = mobile
    ? DEFAULT_PS_SOCIAL_MOBILE
    : DEFAULT_PS_SOCIAL_DESKTOP;

  // Momentum-Based GD parameters
  momentumLearningRate.value = mobile
    ? DEFAULT_MOMENTUM_LEARNING_RATE_MOBILE
    : DEFAULT_MOMENTUM_LEARNING_RATE_DESKTOP;
  momentumBeta.value = mobile
    ? DEFAULT_MOMENTUM_BETA_MOBILE
    : DEFAULT_MOMENTUM_BETA_DESKTOP;
};

// Generate normally distributed random number (Box-Muller transform)
const randomNormal = (mean: number, stdDev: number): number => {
  const u1: number = Math.random();
  const u2: number = Math.random();
  const z0: number =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
};

// Generate uniformly distributed random number
const randomUniform = (mean: number, range: number): number => {
  return mean + (Math.random() - 0.5) * 2 * range;
};

// Apply mutation based on distribution type
const applyMutation = (value: number, variance: number): number => {
  // @ts-ignore
  if (MUTATION_DISTRIBUTION_TYPE === 'uniform') {
    return randomUniform(value, variance);
  } else {
    return randomNormal(value, variance);
  }
};

// Calculate adaptive variance scale based on fitness
// Low fitness (good) -> low scale (fine-tuning)
// High fitness (bad) -> high scale (exploration)
const getAdaptiveVarianceScale = (fitness: number): number => {
  if (!ADAPTIVE_VARIANCE_ENABLED) {
    return 1.0;
  }

  // Use square root scaling: scale = sqrt(fitness / target)
  const rawScale: number = Math.sqrt(
    fitness / ADAPTIVE_VARIANCE_FITNESS_TARGET
  );

  // Clamp to min/max range
  return Math.max(
    ADAPTIVE_VARIANCE_MIN_SCALE,
    Math.min(ADAPTIVE_VARIANCE_MAX_SCALE, rawScale)
  );
};

// Calculate weight-proportional variance scale based on weight magnitude
// Larger weights (absolute value) -> larger variance
// Smaller weights -> smaller variance
const getWeightProportionalScale = (weight: number): number => {
  if (!WEIGHT_PROPORTIONAL_VARIANCE_ENABLED) {
    return 1.0;
  }

  const absWeight: number = Math.abs(weight);
  // Scale = min + (absWeight * factor)
  // This gives proportional scaling with a minimum baseline
  return (
    WEIGHT_PROPORTIONAL_VARIANCE_MIN +
    absWeight * WEIGHT_PROPORTIONAL_VARIANCE_FACTOR
  );
};

// Perform one gradient descent step
const gradientDescentStep = (): void => {
  const gradients: number[] = [];

  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;

  for (let i = 0; i < curve.weights.length; i++) {
    gradients.push(0);
  }

  // Calculate gradients for each weight
  for (const point of points.value) {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;

    // Gradient for each weight: d(MSE)/d(w_i) = 2 * error * x^i / n
    for (let i: number = 0; i < gradients.length; i++) {
      gradients[i] += (2 * error * Math.pow(point.x, i)) / points.value.length;
    }
  }

  // Add L2 regularization gradient: d(penalty)/d(w_i) = 2 * lambda * w_i
  // where lambda is the weightPenalty value
  if (weightPenalty.value > 0) {
    for (let i: number = 0; i < curve.weights.length; i++) {
      gradients[i] += 2 * weightPenalty.value * curve.weights[i];
    }
  }

  // Add stochastic noise to gradients based on stochasticity value
  if (stochasticity.value > 0) {
    for (let i: number = 0; i < gradients.length; i++) {
      // Add Gaussian noise proportional to stochasticity
      // The noise magnitude scales with the gradient magnitude
      const gradientMagnitude: number = Math.abs(gradients[i]);
      const noiseMagnitude: number = gradientMagnitude * stochasticity.value;
      const noise: number = randomNormal(0, noiseMagnitude);
      gradients[i] += noise;
    }
  }

  // Update weights using gradient descent
  curve.weights = curve.weights.map(
    (weight: number, i: number): number =>
      weight - learningRate.value * gradients[i]
  );

  updateFitness();
};

// Perform one Adam optimization step
const adamStep = (): void => {
  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;

  // Initialize Adam state if needed
  if (adamM.value.length !== curve.weights.length) {
    adamM.value = new Array(curve.weights.length).fill(0);
    adamV.value = new Array(curve.weights.length).fill(0);
    adamT.value = 0;
  }

  // Increment time step
  adamT.value += 1;

  const gradients: number[] = new Array(curve.weights.length).fill(0);

  // Calculate gradients for each weight
  points.value.forEach((point: Point): void => {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;

    // Gradient for each weight: d(MSE)/d(w_i) = 2 * error * x^i / n
    for (let i: number = 0; i < curve.weights.length; i++) {
      gradients[i] += (2 * error * Math.pow(point.x, i)) / points.value.length;
    }
  });

  // Add L2 regularization gradient
  if (weightPenalty.value > 0) {
    for (let i: number = 0; i < curve.weights.length; i++) {
      gradients[i] += 2 * weightPenalty.value * curve.weights[i];
    }
  }

  // Update weights using Adam optimizer
  curve.weights = curve.weights.map((weight: number, i: number): number => {
    // Update biased first moment estimate
    adamM.value[i] =
      adamBeta1.value * adamM.value[i] + (1 - adamBeta1.value) * gradients[i];

    // Update biased second moment estimate
    adamV.value[i] =
      adamBeta2.value * adamV.value[i] +
      (1 - adamBeta2.value) * gradients[i] * gradients[i];

    // Compute bias-corrected first moment estimate
    const mHat: number =
      adamM.value[i] / (1 - Math.pow(adamBeta1.value, adamT.value));

    // Compute bias-corrected second moment estimate
    const vHat: number =
      adamV.value[i] / (1 - Math.pow(adamBeta2.value, adamT.value));

    // Update weight
    return (
      weight -
      (adamLearningRate.value * mHat) / (Math.sqrt(vHat) + adamEpsilon.value)
    );
  });

  updateFitness();
};

// Perform one Simulated Annealing step
const simulatedAnnealingStep = (): void => {
  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;

  // Initialize if needed
  if (saCurrentBest.value === null) {
    saCurrentBest.value = [...curve.weights];
    saBestFitness.value = curve.fitness;
    saTemperature.value = saInitialTemp.value;
  }

  for (let iter = 0; iter < saIterations.value; iter++) {
    // Generate neighbor solution by perturbing random weight
    const newWeights: number[] = [...curve.weights];
    const randomIndex: number = Math.floor(Math.random() * newWeights.length);
    const perturbation: number = randomNormal(0, saTemperature.value);
    newWeights[randomIndex] += perturbation;

    // Evaluate new solution
    const newCurve: Curve = { id: 0, weights: newWeights, fitness: 0 };
    newCurve.fitness = calculateBaseFitness(newCurve);

    // Calculate fitness with penalty
    const currentFitness: number = calculateFitnessWithPenalty(curve);
    const newFitness: number =
      newCurve.fitness + calculateWeightPenalty(newCurve);

    // Accept or reject based on Metropolis criterion
    const delta: number = newFitness - currentFitness;
    if (delta < 0 || Math.random() < Math.exp(-delta / saTemperature.value)) {
      // Accept new solution
      curve.weights = newWeights;
      curve.fitness = newCurve.fitness;

      // Update best if improved
      if (newCurve.fitness < saBestFitness.value) {
        saCurrentBest.value = [...newWeights];
        saBestFitness.value = newCurve.fitness;
      }
    }
  }

  // Cool down temperature
  saTemperature.value *= saCoolingRate.value;

  updateFitness();
};

// Gaussian elimination with partial pivoting to solve linear system Ax = b
const gaussianElimination = (A: number[][], b: number[]): number[] | null => {
  const n = A.length;
  // Create augmented matrix
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);

  // Forward elimination with partial pivoting
  for (let k = 0; k < n; k++) {
    // Find pivot
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > Math.abs(aug[maxRow][k])) {
        maxRow = i;
      }
    }

    // Swap rows
    [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];

    // Check for singular matrix
    if (Math.abs(aug[k][k]) < 1e-10) {
      return null;
    }

    // Eliminate column k
    for (let i = k + 1; i < n; i++) {
      const factor = aug[i][k] / aug[k][k];
      for (let j = k; j <= n; j++) {
        aug[i][j] -= factor * aug[k][j];
      }
    }
  }

  // Back substitution
  const x: number[] = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }

  return x;
};

// Solve polynomial exactly using linear algebra (Vandermonde system)
const solvePolynomialExact = (): void => {
  if (curves.value.length === 0) return;
  const curve: Curve = curves.value[0]!;

  // If more points than weights, no unique solution exists
  if (numPoints.value > numWeights.value) {
    // Will display "no solution" message in canvas
    return;
  }

  // Use min(numPoints, numWeights) points to solve
  const n = Math.min(numPoints.value, numWeights.value);
  const pointsToUse = points.value.slice(0, n);

  // Build Vandermonde matrix A and vector b
  // A[i][j] = x_i^j (x to the power j)
  // b[i] = y_i
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(Math.pow(pointsToUse[i].x, j));
    }
    A.push(row);
    b.push(pointsToUse[i].y);
  }

  // Solve Ax = b using Gaussian elimination
  const solution = gaussianElimination(A, b);

  if (solution !== null) {
    // Set the weights from solution
    for (let i = 0; i < numWeights.value; i++) {
      if (i < n) {
        curve.weights[i] = solution[i];
      } else {
        // Set extra weights to zero
        curve.weights[i] = 0;
      }
    }

    curve.fitness = calculateBaseFitness(curve);
  }

  updateFitness();
};

// Perform one Momentum-based Gradient Descent step
const momentumStep = (): void => {
  const gradients: number[] = [];

  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;

  // Initialize velocity if needed
  if (momentumV.value.length !== curve.weights.length) {
    momentumV.value = new Array(curve.weights.length).fill(0);
  }

  for (let i = 0; i < curve.weights.length; i++) {
    gradients.push(0);
  }

  // Calculate gradients for each weight
  for (const point of points.value) {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;

    // Gradient for each weight: d(MSE)/d(w_i) = 2 * error * x^i / n
    for (let i: number = 0; i < gradients.length; i++) {
      gradients[i] += (2 * error * Math.pow(point.x, i)) / points.value.length;
    }
  }

  // Add L2 regularization gradient
  if (weightPenalty.value > 0) {
    for (let i: number = 0; i < curve.weights.length; i++) {
      gradients[i] += 2 * weightPenalty.value * curve.weights[i];
    }
  }

  // Update weights using momentum
  curve.weights = curve.weights.map((weight: number, i: number): number => {
    // Update velocity: v = beta * v + learning_rate * gradient
    momentumV.value[i] =
      momentumBeta.value * momentumV.value[i] +
      momentumLearningRate.value * gradients[i];

    // Update weight: w = w - v
    return weight - momentumV.value[i];
  });

  updateFitness();
};

// Initialize particle swarm
const initializeParticleSwarm = (): void => {
  psParticlesState.value = Array.from(
    { length: psParticles.value },
    (_value: unknown, i: number): Particle => {
      // Initialize weights with small random values for diversity
      const weights: number[] = Array.from(
        { length: numWeights.value },
        () => randomNormal(0, 0.1) // Small random values around 0
      );
      // Initialize velocity with small random values
      const velocity: number[] = Array.from(
        { length: numWeights.value },
        () => randomNormal(0, 0.01) // Small random velocities
      );
      return {
        weights: weights,
        velocity: velocity,
        bestWeights: [...weights],
        bestFitness: Infinity,
      };
    }
  );

  psGlobalBestWeights.value = [];
  psGlobalBestFitness.value = Infinity;

  // Evaluate initial particles
  psParticlesState.value.forEach((particle: Particle): void => {
    const curve: Curve = { id: 0, weights: particle.weights, fitness: 0 };
    curve.fitness = calculateBaseFitness(curve);
    const fitness: number = curve.fitness + calculateWeightPenalty(curve);

    particle.bestFitness = fitness;

    if (fitness < psGlobalBestFitness.value) {
      psGlobalBestFitness.value = fitness;
      psGlobalBestWeights.value = [...particle.weights];
    }
  });

  // Update curves for display
  updateParticleSwarmCurves();
};

// Update curves from particles for display
const updateParticleSwarmCurves = (): void => {
  curves.value = psParticlesState.value.map(
    (particle: Particle, i: number): Curve => ({
      id: i,
      weights: particle.weights,
      fitness: calculateBaseFitness({
        id: 0,
        weights: particle.weights,
        fitness: 0,
      }),
    })
  );
};

// Perform one Particle Swarm Optimization step
const particleSwarmStep = (): void => {
  if (psParticlesState.value.length === 0) {
    initializeParticleSwarm();
    return;
  }

  psParticlesState.value.forEach((particle: Particle): void => {
    // Update velocity and position for each weight
    for (let i: number = 0; i < particle.weights.length; i++) {
      const r1: number = Math.random();
      const r2: number = Math.random();

      // Update velocity
      particle.velocity[i] =
        psInertia.value * particle.velocity[i] +
        psCognitive.value *
          r1 *
          (particle.bestWeights[i] - particle.weights[i]) +
        psSocial.value *
          r2 *
          (psGlobalBestWeights.value[i] - particle.weights[i]);

      // Update position
      particle.weights[i] += particle.velocity[i];
    }

    // Evaluate new position
    const curve: Curve = { id: 0, weights: particle.weights, fitness: 0 };
    curve.fitness = calculateBaseFitness(curve);
    const fitness: number = curve.fitness + calculateWeightPenalty(curve);

    // Update personal best
    if (fitness < particle.bestFitness) {
      particle.bestFitness = fitness;
      particle.bestWeights = [...particle.weights];
    }

    // Update global best
    if (fitness < psGlobalBestFitness.value) {
      psGlobalBestFitness.value = fitness;
      psGlobalBestWeights.value = [...particle.weights];
    }
  });

  // Update curves for display
  updateParticleSwarmCurves();
};

// Generate curves by mutating the best curve
// Index 0 = exact copy, last index = maximum variance
const generateCurvesFromBest = (): void => {
  const bestCurve: Curve | null = getBestCurve();
  if (bestCurve === null) {
    // If no curves exist, generate random ones
    generateCurves();
    return;
  }

  // Calculate adaptive variance scale based on best fitness
  const adaptiveScale: number = getAdaptiveVarianceScale(bestCurve.fitness);

  curves.value = Array.from(
    { length: numChildren.value },
    (_value: unknown, i: number): Curve => {
      // Calculate base variance for this index (min to max range)
      const varianceFactor: number = Math.pow(
        i / (numChildren.value - 1),
        MUTATION_VARIANCE_EXPONENT
      );
      const baseVariance: number =
        MUTATION_MIN_VARIANCE +
        varianceFactor * (mutationVariance.value - MUTATION_MIN_VARIANCE);

      // Apply adaptive scaling to base variance
      const adaptiveVariance: number = baseVariance * adaptiveScale;

      // Apply mutations to each weight
      const mutatedWeights: number[] = bestCurve.weights.map(
        (weight: number, weightIndex: number): number => {
          // Get variance scale for this weight (default to 1.0 if not specified)
          const varianceScale: number =
            MUTATION_WEIGHT_VARIANCE_SCALES[weightIndex] ?? 1.0;

          // Get weight-proportional scale based on magnitude
          const weightProportionalScale: number =
            getWeightProportionalScale(weight);

          // Combine all scaling factors
          const weightVariance: number =
            adaptiveVariance * varianceScale * weightProportionalScale;

          return applyMutation(weight, weightVariance);
        }
      );

      return {
        id: i,
        weights: mutatedWeights,
        fitness: 0,
      };
    }
  );

  updateFitness();
};

// Animation loop using requestAnimationFrame
const animationLoop = (currentTime: number): void => {
  // Calculate time delta in seconds
  if (lastFrameTime === 0) {
    lastFrameTime = currentTime;
  }
  const deltaTime: number = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;

  // Accumulate iterations to run based on desired rate
  generationAccumulator += deltaTime * generationsPerSec.value;

  // Run as many iterations as accumulated (can be 0, 1, or multiple)
  while (generationAccumulator >= 1) {
    switch (solutionMethod.value) {
      case 'genetic':
        generateCurvesFromBest();
        break;
      case 'gradient':
        gradientDescentStep();
        break;
      case 'adam':
        adamStep();
        break;
      case 'simulated-annealing':
        simulatedAnnealingStep();
        break;
      case 'particle-swarm':
        particleSwarmStep();
        break;
      case 'momentum':
        momentumStep();
        break;
      case 'polynomial-solver':
        solvePolynomialExact();
        break;
      default:
        throw new Error(`Unknown solution method: ${solutionMethod.value}`);
    }
    generationAccumulator -= 1;
  }

  // Draw the canvas
  draw();

  // Request next frame
  animationFrameId = window.requestAnimationFrame(animationLoop);
};

// Start continuous evolution
const startEvolution = (): void => {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
  }
  lastFrameTime = 0;
  generationAccumulator = 0;
  animationFrameId = window.requestAnimationFrame(animationLoop);
};

// Stop continuous evolution
const stopEvolution = (): void => {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// Polynomial function: y = w[0] + w[1]*x + w[2]*x^2 + ... + w[n]*x^n
const evaluateCurve = (curve: Curve, x: number): number => {
  return curve.weights.reduce(
    (sum: number, weight: number, index: number): number => {
      return sum + weight * Math.pow(x, index);
    },
    0
  );
};

// Calculate base fitness (Mean Squared Error only - lower is better)
const calculateBaseFitness = (curve: Curve): number => {
  let sumSquaredError: number = 0;
  points.value.forEach((point: Point): void => {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;
    sumSquaredError += error * error;
  });
  return sumSquaredError / points.value.length;
};

// Calculate weight penalty for selection (sum of squared weights)
const calculateWeightPenalty = (curve: Curve): number => {
  if (weightPenalty.value === 0) {
    return 0;
  }
  let penalty: number = 0;
  curve.weights.forEach((weight: number): void => {
    penalty += weight * weight;
  });
  return penalty * weightPenalty.value;
};

// Calculate fitness with weight penalty for selection within a generation
const calculateFitnessWithPenalty = (curve: Curve): number => {
  return curve.fitness + calculateWeightPenalty(curve);
};

// Update fitness for all curves (stores base MSE only)
const updateFitness = (): void => {
  curves.value.forEach((curve: Curve): void => {
    curve.fitness = calculateBaseFitness(curve);
  });
};

// Get sorted curves by fitness with weight penalty applied for selection (best first)
const sortedCurves = computed((): Curve[] => {
  return [...curves.value].sort(
    (a: Curve, b: Curve): number =>
      calculateFitnessWithPenalty(a) - calculateFitnessWithPenalty(b)
  );
});

// Get best curve or null if no curves exist
const getBestCurve = (): Curve | null => {
  const firstCurve: Curve | undefined = sortedCurves.value[0];
  return firstCurve !== undefined ? firstCurve : null;
};

// Format number with explicit sign (always show + or -)
const formatWithSign = (value: number, decimals: number = 2): string => {
  const formatted: string = value.toFixed(decimals);
  return value >= 0 ? `+${formatted}` : formatted;
};

// Alias for the shared utility function
const formatScientific = generateScientificNotation;

// Generate upper bound for summation notation
const upperBound = computed((): string => {
  const n: number = numWeights.value - 1;
  return n.toString();
});

// Calculate optimal canvas size based on viewport
const calculateCanvasSize = (): void => {
  const viewportHeight: number = window.innerHeight;
  const viewportWidth: number = window.innerWidth;
  const isMobile: boolean = viewportWidth < MOBILE_BREAKPOINT;

  const heightOffset: number = isMobile
    ? VIEWPORT_HEIGHT_OFFSET_MOBILE
    : VIEWPORT_HEIGHT_OFFSET;
  const widthOffset: number = isMobile
    ? VIEWPORT_WIDTH_OFFSET_MOBILE
    : VIEWPORT_WIDTH_OFFSET;
  const minSize: number = isMobile ? MIN_CANVAS_SIZE_MOBILE : MIN_CANVAS_SIZE;

  const availableHeight: number = viewportHeight - heightOffset;
  const availableWidth: number = viewportWidth - widthOffset;
  const size: number = Math.min(availableHeight, availableWidth);
  CANVAS_SIZE.value = Math.max(minSize, Math.floor(size));
};

// Convert coordinates from coordinate system range to canvas coordinates
const toCanvasCoords = (x: number, y: number): CanvasCoords => {
  const size: number = CANVAS_SIZE.value - 2 * PADDING;
  const range: number = COORD_MAX - COORD_MIN;
  return {
    cx: PADDING + ((x - COORD_MIN) * size) / range,
    cy: CANVAS_SIZE.value - PADDING - ((y - COORD_MIN) * size) / range,
  };
};

// Convert canvas coordinates back to coordinate system values
const toCoordSystemCoords = (cx: number, cy: number): CoordSystemCoords => {
  const size: number = CANVAS_SIZE.value - 2 * PADDING;
  const range: number = COORD_MAX - COORD_MIN;
  return {
    x: COORD_MIN + ((cx - PADDING) * range) / size,
    y: COORD_MIN + ((CANVAS_SIZE.value - PADDING - cy) * range) / size,
  };
};

// Get color for curve based on rank
const getCurveColor = (index: number): string => {
  return index === 0 ? getAlgoColor() : OTHER_CURVE_COLOR;
};

// Find point at given canvas position (returns index or null)
const getPointAtPosition = (cx: number, cy: number): number | null => {
  const hitRadius: number = POINT_RADIUS + 5; // Slightly larger hit area

  for (let i: number = 0; i < points.value.length; i++) {
    const point: Point | undefined = points.value[i];
    if (point === undefined) continue;

    const coords: CanvasCoords = toCanvasCoords(point.x, point.y);
    const dx: number = cx - coords.cx;
    const dy: number = cy - coords.cy;
    const distance: number = Math.sqrt(dx * dx + dy * dy);

    if (distance <= hitRadius) {
      return i;
    }
  }

  return null;
};

// Mouse event handlers for point dragging
const handleMouseDown = (event: MouseEvent): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null) return;

  const rect: DOMRect = canvas.getBoundingClientRect();
  const cx: number = event.clientX - rect.left;
  const cy: number = event.clientY - rect.top;

  const pointIndex: number | null = getPointAtPosition(cx, cy);
  if (pointIndex !== null) {
    draggingPointIndex.value = pointIndex;
  }
};

const handleMouseMove = (event: MouseEvent): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null) return;

  const rect: DOMRect = canvas.getBoundingClientRect();
  const cx: number = event.clientX - rect.left;
  const cy: number = event.clientY - rect.top;

  // If dragging, update point position
  if (draggingPointIndex.value !== null) {
    const coords: CoordSystemCoords = toCoordSystemCoords(cx, cy);

    // Clamp to bounds
    const clampedX: number = Math.max(COORD_MIN, Math.min(COORD_MAX, coords.x));
    const clampedY: number = Math.max(COORD_MIN, Math.min(COORD_MAX, coords.y));

    // Update the point in allPoints array
    allPoints.value[draggingPointIndex.value] = {
      x: clampedX,
      y: clampedY,
    };

    // Update fitness calculations
    updateFitness();
  } else {
    // Not dragging, update hover state
    const pointIndex: number | null = getPointAtPosition(cx, cy);
    hoveredPointIndex.value = pointIndex;
  }
};

const handleMouseUp = (): void => {
  draggingPointIndex.value = null;
};

const handleMouseLeave = (): void => {
  draggingPointIndex.value = null;
  hoveredPointIndex.value = null;
};

// Touch event handlers for mobile point dragging
const handleTouchStart = (event: TouchEvent): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null || event.touches.length === 0) return;

  event.preventDefault(); // Prevent scrolling while touching canvas

  const rect: DOMRect = canvas.getBoundingClientRect();
  const touch: Touch | null = event.touches[0] || null;

  if (touch === null) return;

  const cx: number = touch.clientX - rect.left;
  const cy: number = touch.clientY - rect.top;

  const pointIndex: number | null = getPointAtPosition(cx, cy);
  if (pointIndex !== null) {
    draggingPointIndex.value = pointIndex;
  }
};

const handleTouchMove = (event: TouchEvent): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null || event.touches.length === 0) return;

  if (draggingPointIndex.value !== null) {
    event.preventDefault(); // Prevent scrolling while dragging

    const rect: DOMRect = canvas.getBoundingClientRect();
    const touch: Touch | null = event.touches[0] || null;

    if (touch === null) return;

    const cx: number = touch.clientX - rect.left;
    const cy: number = touch.clientY - rect.top;

    const coords: CoordSystemCoords = toCoordSystemCoords(cx, cy);

    // Clamp to bounds
    const clampedX: number = Math.max(COORD_MIN, Math.min(COORD_MAX, coords.x));
    const clampedY: number = Math.max(COORD_MIN, Math.min(COORD_MAX, coords.y));

    // Update the point in allPoints array
    allPoints.value[draggingPointIndex.value] = {
      x: clampedX,
      y: clampedY,
    };

    // Update fitness calculations
    updateFitness();
  }
};

const handleTouchEnd = (): void => {
  draggingPointIndex.value = null;
  hoveredPointIndex.value = null;
};

// Draw everything on canvas
const draw = (): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null) return;

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (ctx === null) return;

  // Scale context for high-resolution rendering
  ctx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);

  // Clear canvas
  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.fillRect(0, 0, CANVAS_SIZE.value, CANVAS_SIZE.value);

  // Draw grid
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = GRID_LINE_WIDTH;
  for (let i: number = 0; i <= 10; i++) {
    const pos: number = PADDING + (i / 10) * (CANVAS_SIZE.value - 2 * PADDING);

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(pos, PADDING);
    ctx.lineTo(pos, CANVAS_SIZE.value - PADDING);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(PADDING, pos);
    ctx.lineTo(CANVAS_SIZE.value - PADDING, pos);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = COLOR_AXES;
  ctx.lineWidth = AXIS_LINE_WIDTH;

  // X-axis
  ctx.beginPath();
  const originCoords: CanvasCoords = toCanvasCoords(0, 0);
  ctx.moveTo(PADDING, originCoords.cy);
  ctx.lineTo(CANVAS_SIZE.value - PADDING, originCoords.cy);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(originCoords.cx, PADDING);
  ctx.lineTo(originCoords.cx, CANVAS_SIZE.value - PADDING);
  ctx.stroke();

  // Check if polynomial solver has no solution
  const hasNoSolution: boolean =
    solutionMethod.value === 'polynomial-solver' &&
    numPoints.value > numWeights.value;

  // Draw all polynomial curves (worst to best so best is on top)
  if (!hasNoSolution) {
    sortedCurves.value
      .slice()
      .reverse()
      .forEach((curve: Curve, index: number): void => {
        const rankIndex: number = sortedCurves.value.length - 1 - index;
        const isPrimary: boolean = rankIndex === 0;

        ctx.strokeStyle = getCurveColor(rankIndex);
        ctx.lineWidth = isPrimary ? BEST_CURVE_LINE_WIDTH : OTHER_CURVE_LINE_WIDTH;
        ctx.globalAlpha = isPrimary ? 1.0 : OTHER_CURVE_OPACITY;
        ctx.beginPath();

        // Extend drawing range horizontally beyond visible area
        const drawMin: number = COORD_MIN - CURVE_HORIZONTAL_OVERDRAW;
        const drawMax: number = COORD_MAX + CURVE_HORIZONTAL_OVERDRAW;
        const range: number = drawMax - drawMin;

        // Use higher resolution for primary curve, lower for auxiliary curves
        const resolution: number = isPrimary ? PRIMARY_CURVE_RESOLUTION : AUXILIARY_CURVE_RESOLUTION;

        for (let i: number = 0; i <= resolution; i++) {
          const x: number = drawMin + (i / resolution) * range;
          const y: number = evaluateCurve(curve, x);
          const coords: CanvasCoords = toCanvasCoords(x, y);

          if (i === 0) {
            ctx.moveTo(coords.cx, coords.cy);
          } else {
            ctx.lineTo(coords.cx, coords.cy);
          }
        }
        ctx.stroke();
      });

    ctx.globalAlpha = 1.0;

    // Draw error bars from points to best fit curve
    const bestCurve: Curve | null = getBestCurve();
    if (bestCurve !== null) {
      ctx.strokeStyle = COLOR_ERROR_BARS;
      ctx.lineWidth = ERROR_BAR_LINE_WIDTH;

      points.value.forEach((point: Point): void => {
        const pointCoords: CanvasCoords = toCanvasCoords(point.x, point.y);
        const predictedY: number = evaluateCurve(bestCurve, point.x);
        const curveCoords: CanvasCoords = toCanvasCoords(point.x, predictedY);

        ctx.beginPath();
        ctx.moveTo(pointCoords.cx, pointCoords.cy);
        ctx.lineTo(curveCoords.cx, curveCoords.cy);
        ctx.stroke();
      });
    }
  }

  // Draw points
  points.value.forEach((point: Point): void => {
    const coords: CanvasCoords = toCanvasCoords(point.x, point.y);

    ctx.fillStyle = POINTS_DARK_GRAY;
    ctx.beginPath();
    ctx.arc(coords.cx, coords.cy, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLOR_POINT_BORDER;
    ctx.lineWidth = DOT_BORDER_WIDTH;
    ctx.stroke();
  });

  // Draw labels
  ctx.fillStyle = COLOR_LABELS;
  ctx.font = '12px monospace';
  const center: number = PADDING + (CANVAS_SIZE.value - 2 * PADDING) / 2;

  // X-axis labels
  ctx.fillText(
    COORD_MIN.toString(),
    PADDING - 15,
    CANVAS_SIZE.value - PADDING + 15
  );
  ctx.fillText('0', center - 5, CANVAS_SIZE.value - PADDING + 15);
  ctx.fillText(
    COORD_MAX.toString(),
    CANVAS_SIZE.value - PADDING - 5,
    CANVAS_SIZE.value - PADDING + 15
  );

  // Y-axis labels
  ctx.fillText(
    COORD_MIN.toString(),
    PADDING - 20,
    CANVAS_SIZE.value - PADDING + 5
  );
  ctx.fillText('0', PADDING - 15, center + 5);
  ctx.fillText(COORD_MAX.toString(), PADDING - 15, PADDING + 5);

  // Display fitness above graph area (drawn last so it's on top)
  if (!hasNoSolution) {
    const bestCurve: Curve | null = getBestCurve();
    if (bestCurve !== null) {
      const fitnessText: string = `Fitness: ${formatScientific(
        bestCurve.fitness,
        8
      )}`;
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ffffff'; // Always white
      ctx.textAlign = 'right';
      ctx.fillText(fitnessText, CANVAS_SIZE.value - PADDING - 5, PADDING - 10);
      ctx.textAlign = 'left'; // Reset to default
    }
  }

  // Draw "No Solution" message on top of everything if needed
  if (hasNoSolution) {
    ctx.fillStyle = TAILWIND_PINK_500;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX: number = CANVAS_SIZE.value / 2;
    const centerY: number = CANVAS_SIZE.value / 2;
    ctx.fillText('No Solution', centerX, centerY - 12);
    ctx.font = '14px monospace';
    ctx.fillText('(More points than coefficients)', centerX, centerY + 12);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
};

// Handle window resize
const handleResize = (): void => {
  calculateCanvasSize();
  // draw() is called in the RAF loop, no need to call here
};

// Initialize
onMounted((): void => {
  calculateCanvasSize();
  generateRandomPoints();
  if (solutionMethod.value === 'genetic') {
    generateCurves();
  } else if (solutionMethod.value === 'particle-swarm') {
    initializeParticleSwarm();
  } else {
    generateSingleCurve();
  }
  draw();
  window.addEventListener('resize', handleResize);
  startEvolution(); // Auto-start evolution/gradient descent
});

onUnmounted((): void => {
  window.removeEventListener('resize', handleResize);
  stopEvolution();
});

// Update fitness when numPoints changes (points auto-updates via computed)
watch(numPoints, (): void => {
  if (allPoints.value.length > 0) {
    updateFitness();
  }
});

// Regenerate curves when numWeights changes
watch(numWeights, (): void => {
  if (curves.value.length > 0) {
    if (solutionMethod.value === 'genetic') {
      generateCurves();
    } else {
      generateSingleCurve();
    }
  }
});

// Regenerate curves when numChildren changes
watch(numChildren, (): void => {
  if (curves.value.length > 0 && solutionMethod.value === 'genetic') {
    generateCurves();
  }
});

// Regenerate swarm when psParticles changes
watch(psParticles, (): void => {
  if (
    solutionMethod.value === 'particle-swarm' &&
    psParticlesState.value.length > 0
  ) {
    initializeParticleSwarm();
  }
});
</script>

<template>
  <div
    class="h-screen-mobile flex flex-col md:flex-row gap-0 md:gap-4 justify-center items-stretch flex-1 overflow-hidden p-0 md:p-0"
  >
    <div
      class="w-full md:w-[600px] md:min-w-0 flex flex-col text-left p-2 md:p-3 bg-ui-bg md:rounded-lg border-0 md:border-2 border-ui-border overflow-y-auto md:overflow-y-auto order-2 md:order-1 md:shrink shrink-0"
    >
      <!-- Sliders - Mobile (reversed order) -->
      <div
        class="mb-2 md:mb-3 flex md:hidden flex-col gap-1.5 md:gap-2 order-1 md:order-2"
      >
        <Slider
          v-for="(config, index) in sliderConfigs"
          :key="config.label"
          :label="config.label"
          v-model="config.model.value"
          :min="config.min"
          :max="config.max"
          :step="config.step"
          :decimals="config.decimals"
          :logarithmic="config.logarithmic"
          :logMidpoint="config.logMidpoint"
          :useScientificNotation="config.useScientificNotation"
          :thumbColor="getAlgoColor()"
        />
      </div>

      <!-- Sliders - Desktop (normal order) -->
      <div
        class="mb-2 md:mb-3 hidden md:flex flex-col gap-1.5 md:gap-2 order-1 md:order-2"
      >
        <Slider
          v-for="(config, index) in sliderConfigs.slice().reverse()"
          :key="config.label"
          :label="config.label"
          v-model="config.model.value"
          :min="config.min"
          :max="config.max"
          :step="config.step"
          :decimals="config.decimals"
          :logarithmic="config.logarithmic"
          :logMidpoint="config.logMidpoint"
          :useScientificNotation="config.useScientificNotation"
          :thumbColor="getAlgoColor()"
        />
      </div>

      <!-- All Buttons -->
      <div class="mb-2 md:mb-3 flex flex-col gap-2 order-2 md:order-1">
        <!-- First Row: Info + Algorithm -->
        <div class="flex items-stretch gap-2">
          <button
            @click="openInfoModal"
            class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0 self-center"
            style="filter: brightness(1)"
            @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
            @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
            @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            aria-label="Information"
            title="Learn more about this project"
          >
            <span class="text-base md:text-sm font-bold">i</span>
          </button>
          <button
            @click="toggleSolutionMethod"
            class="flex-1 py-3 md:py-2 px-2 text-sm md:text-base font-bold text-white border-none rounded cursor-pointer transition-all text-center flex items-center justify-center"
            :style="{ backgroundColor: getAlgoColor() }"
            @mouseover="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
            @mouseout="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(1)'
            "
            @mousedown="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.8)'
            "
            @mouseup="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
            title="Switch optimization method"
          >
            <span v-if="solutionMethod === 'genetic'">Genetic Algorithm</span>
            <span v-else-if="solutionMethod === 'gradient'"
              >Gradient Descent - Stochastic</span
            >
            <span v-else-if="solutionMethod === 'adam'"
              >Gradient Descent - Adam</span
            >
            <span v-else-if="solutionMethod === 'simulated-annealing'"
              >Simulated Annealing</span
            >
            <span v-else-if="solutionMethod === 'particle-swarm'"
              >Particle Swarm</span
            >
            <span v-else-if="solutionMethod === 'polynomial-solver'"
              >Polynomial Solver</span
            >
            <span v-else>Gradient Descent - Momentum</span>
          </button>
        </div>

        <!-- Second Row: Reset/New Buttons -->
        <div class="flex items-stretch gap-2">
          <button
            @click="resetCurrentAlgorithm"
            class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
            :style="{ backgroundColor: getAlgoColor() }"
            @mouseover="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
            @mouseout="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(1)'
            "
            @mousedown="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.8)'
            "
            @mouseup="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
          >
            Reset Algo
          </button>
          <button
            @click="resetParameters"
            class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
            :style="{ backgroundColor: getAlgoColor() }"
            @mouseover="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
            @mouseout="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(1)'
            "
            @mousedown="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.8)'
            "
            @mouseup="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
          >
            Reset Params
          </button>
          <button
            @click="generateRandomPoints"
            class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
            :style="{ backgroundColor: POINTS_DARK_GRAY }"
            @mouseover="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
            @mouseout="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(1)'
            "
            @mousedown="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.8)'
            "
            @mouseup="
              ($event.currentTarget as HTMLElement).style.filter =
                'brightness(0.9)'
            "
          >
            New Points
          </button>
        </div>
      </div>

      <!-- Table -->
      <div
        class="hidden md:flex bg-ui-bg-dark font-bold text-ui-text text-xs shrink-0 order-3"
      >
        <div class="flex-1 flex">
          <div
            v-for="wIndex in numWeights"
            :key="wIndex"
            class="flex-1 text-center flex items-center justify-center"
            :class="
              numWeights > 6 && numWeights <= 20 ? 'text-[10px]' : 'text-sm'
            "
          >
            <template v-if="numWeights > 20">
              <!-- No text for more than 20 columns -->
            </template>
            <template v-else-if="numWeights > 6">
              {{ wIndex - 1 }}
            </template>
            <template v-else>
              <template v-if="wIndex === 1">1</template>
              <template v-else-if="wIndex === 2">x</template>
              <template v-else
                >x<sup>{{ wIndex - 1 }}</sup></template
              >
            </template>
          </div>
        </div>
        <div class="w-20 text-center flex items-center justify-center">
          Fitness
        </div>
      </div>

      <div class="flex-1 overflow-hidden hidden md:flex flex-col order-4">
        <div
          v-for="(curve, index) in sortedCurves"
          :key="curve.id"
          class="flex flex-1 font-mono text-xs transition-colors"
          :class="
            index === 0 ||
            (solutionMethod !== 'genetic' &&
              solutionMethod !== 'particle-swarm')
              ? 'bg-ui-bg-highlight'
              : 'bg-ui-bg-dark hover:bg-ui-bg-hover'
          "
        >
          <div class="flex-1 flex">
            <WeightCell
              v-for="(weight, wIndex) in curve.weights"
              :key="wIndex"
              :weight="weight"
              :index="wIndex"
              :showFormula="numWeights < 6"
            />
          </div>
          <div
            class="w-20 flex items-center justify-center font-bold text-ui-text text-xs md:text-sm font-mono"
          >
            {{ formatScientific(curve.fitness, 2) }}
          </div>
        </div>
      </div>
    </div>

    <canvas
      ref="canvasRef"
      :width="CANVAS_SIZE * CANVAS_SCALE"
      :height="CANVAS_SIZE * CANVAS_SCALE"
      class="border-0 md:border-2 border-ui-border md:rounded-lg bg-canvas-bg touch-none order-1 md:order-2 w-full min-h-0 flex-1 max-w-full object-contain object-top md:max-w-[66vw] md:h-full md:flex-initial"
      :style="{
        cursor:
          hoveredPointIndex !== null || draggingPointIndex !== null
            ? 'pointer'
            : 'default',
      }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    />

    <!-- Info Modal -->
    <InfoModal
      :isOpen="isInfoModalOpen"
      @close="closeInfoModal"
    />
  </div>
</template>
