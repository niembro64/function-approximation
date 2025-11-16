<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue';
import Slider from './Slider.vue';
import WeightCell from './WeightCell.vue';
import InfoModal from './InfoModal.vue';
import AlgorithmSelectModal from './AlgorithmSelectModal.vue';
import { generateScientificNotation } from '../utils/formatters';
import type {
  Point,
  Curve,
  CanvasCoords,
  CoordSystemCoords,
  SliderConfig,
  Particle,
  MutationDistribution,
  SolutionMethod,
} from '../types';
import {
  TAILWIND_PURPLE_500,
  TAILWIND_VIOLET_500,
  TAILWIND_INDIGO_500,
  TAILWIND_BLUE_500,
  TAILWIND_CYAN_500,
  TAILWIND_GREEN_600,
  TAILWIND_LIME_700,
  TAILWIND_EMERALD_600,
  TAILWIND_YELLOW_600,
  TAILWIND_PINK_500,
  TAILWIND_FUCSHIA_500,
  TAILWIND_RED_500,
  POINTS_DARK_GRAY,
  POINTS_GRAY,
  ALGO_GENETIC_ALGORITHM,
  ALGO_PARTICLE_SWARM,
  ALGO_GRADIENT_DESCENT,
  ALGO_MOMENTUM_BASED_GD,
  ALGO_ADAM_OPTIMIZER,
  ALGO_SIMULATED_ANNEALING,
  ALGO_POLYNOMIAL_SOLVER,
  ALGO_RANDOM_SEARCH,
  MIN_POINTS,
  MAX_POINTS,
  DEFAULT_NUM_POINTS_DESKTOP,
  DEFAULT_NUM_POINTS_MOBILE,
  MIN_WEIGHTS,
  MAX_WEIGHTS,
  DEFAULT_NUM_WEIGHTS_DESKTOP,
  DEFAULT_NUM_WEIGHTS_MOBILE,
  MIN_CHILDREN,
  MAX_CHILDREN,
  DEFAULT_NUM_CHILDREN_DESKTOP,
  DEFAULT_NUM_CHILDREN_MOBILE,
  MIN_GENERATIONS_PER_SEC,
  MAX_GENERATIONS_PER_SEC,
  DEFAULT_GENERATIONS_PER_SEC_DESKTOP,
  DEFAULT_GENERATIONS_PER_SEC_MOBILE,
  MIN_MUTATION_VARIANCE,
  MAX_MUTATION_VARIANCE,
  DEFAULT_MUTATION_VARIANCE_DESKTOP,
  DEFAULT_MUTATION_VARIANCE_MOBILE,
  MIN_WEIGHT_PENALTY,
  MAX_WEIGHT_PENALTY,
  DEFAULT_WEIGHT_PENALTY_DESKTOP,
  DEFAULT_WEIGHT_PENALTY_MOBILE,
  MIN_LEARNING_RATE,
  MAX_LEARNING_RATE,
  DEFAULT_LEARNING_RATE_DESKTOP,
  DEFAULT_LEARNING_RATE_MOBILE,
  MIN_STOCHASTICITY,
  MAX_STOCHASTICITY,
  DEFAULT_STOCHASTICITY_DESKTOP,
  DEFAULT_STOCHASTICITY_MOBILE,
  MIN_ADAM_LEARNING_RATE,
  MAX_ADAM_LEARNING_RATE,
  DEFAULT_ADAM_LEARNING_RATE_DESKTOP,
  DEFAULT_ADAM_LEARNING_RATE_MOBILE,
  MIN_ADAM_BETA1,
  MAX_ADAM_BETA1,
  DEFAULT_ADAM_BETA1_DESKTOP,
  DEFAULT_ADAM_BETA1_MOBILE,
  MIN_ADAM_BETA2,
  MAX_ADAM_BETA2,
  DEFAULT_ADAM_BETA2_DESKTOP,
  DEFAULT_ADAM_BETA2_MOBILE,
  MIN_ADAM_EPSILON,
  MAX_ADAM_EPSILON,
  DEFAULT_ADAM_EPSILON_DESKTOP,
  DEFAULT_ADAM_EPSILON_MOBILE,
  MIN_SA_INITIAL_TEMP,
  MAX_SA_INITIAL_TEMP,
  DEFAULT_SA_INITIAL_TEMP_DESKTOP,
  DEFAULT_SA_INITIAL_TEMP_MOBILE,
  MIN_SA_COOLING_RATE,
  MAX_SA_COOLING_RATE,
  DEFAULT_SA_COOLING_RATE_DESKTOP,
  DEFAULT_SA_COOLING_RATE_MOBILE,
  MIN_SA_ITERATIONS,
  MAX_SA_ITERATIONS,
  DEFAULT_SA_ITERATIONS_DESKTOP,
  DEFAULT_SA_ITERATIONS_MOBILE,
  MIN_PS_PARTICLES,
  MAX_PS_PARTICLES,
  DEFAULT_PS_PARTICLES_DESKTOP,
  DEFAULT_PS_PARTICLES_MOBILE,
  MIN_PS_INERTIA,
  MAX_PS_INERTIA,
  DEFAULT_PS_INERTIA_DESKTOP,
  DEFAULT_PS_INERTIA_MOBILE,
  MIN_PS_COGNITIVE,
  MAX_PS_COGNITIVE,
  DEFAULT_PS_COGNITIVE_DESKTOP,
  DEFAULT_PS_COGNITIVE_MOBILE,
  MIN_PS_SOCIAL,
  MAX_PS_SOCIAL,
  DEFAULT_PS_SOCIAL_DESKTOP,
  DEFAULT_PS_SOCIAL_MOBILE,
  MIN_MOMENTUM_LEARNING_RATE,
  MAX_MOMENTUM_LEARNING_RATE,
  DEFAULT_MOMENTUM_LEARNING_RATE_DESKTOP,
  DEFAULT_MOMENTUM_LEARNING_RATE_MOBILE,
  MIN_MOMENTUM_BETA,
  MAX_MOMENTUM_BETA,
  DEFAULT_MOMENTUM_BETA_DESKTOP,
  DEFAULT_MOMENTUM_BETA_MOBILE,
  MIN_RS_CURVES,
  MAX_RS_CURVES,
  DEFAULT_RS_CURVES_DESKTOP,
  DEFAULT_RS_CURVES_MOBILE,
  POINT_RADIUS,
  DOT_BORDER_COLOR,
  DOT_BORDER_WIDTH,
  BEST_CURVE_LINE_WIDTH,
  OTHER_CURVE_LINE_WIDTH,
  OTHER_CURVE_COLOR,
  OTHER_CURVE_OPACITY,
  MUTATION_DISTRIBUTION_TYPE,
  MUTATION_MIN_VARIANCE,
  MUTATION_VARIANCE_EXPONENT,
  MUTATION_WEIGHT_VARIANCE_SCALES,
  ADAPTIVE_VARIANCE_ENABLED,
  ADAPTIVE_VARIANCE_MIN_SCALE,
  ADAPTIVE_VARIANCE_MAX_SCALE,
  ADAPTIVE_VARIANCE_FITNESS_TARGET,
  WEIGHT_PROPORTIONAL_VARIANCE_ENABLED,
  WEIGHT_PROPORTIONAL_VARIANCE_FACTOR,
  WEIGHT_PROPORTIONAL_VARIANCE_MIN,
  COORD_MIN,
  COORD_MAX,
  CURVE_HORIZONTAL_OVERDRAW,
  CANVAS_SCALE,
  PADDING,
  MIN_CANVAS_SIZE,
  MIN_CANVAS_SIZE_MOBILE,
  VIEWPORT_HEIGHT_OFFSET,
  VIEWPORT_HEIGHT_OFFSET_MOBILE,
  VIEWPORT_WIDTH_OFFSET,
  VIEWPORT_WIDTH_OFFSET_MOBILE,
  MOBILE_BREAKPOINT,
  PRIMARY_CURVE_RESOLUTION,
  AUXILIARY_CURVE_RESOLUTION,
  ERROR_BAR_LINE_WIDTH,
  GRID_LINE_WIDTH,
  AXIS_LINE_WIDTH,
  COLOR_ERROR_BARS,
  COLOR_POINT_BORDER,
  COLOR_BACKGROUND,
  COLOR_GRID,
  COLOR_AXES,
  COLOR_LABELS,
  ALGORITHM_ORDER,
  isMobile,
  getAlgoColor,
  getAlgoInfo,
} from '../config';

// ============================================================
// Reactive state
// ============================================================

const CANVAS_SIZE = ref<number>(500);

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
const psParticlesState = ref<Particle[]>([]);
const psGlobalBestWeights = ref<number[]>([]);
const psGlobalBestFitness = ref<number>(Infinity);

// Momentum state
const momentumV = ref<number[]>([]); // Velocity

// Random Search state
const rsCurves = ref<number>(
  isMobile() ? DEFAULT_RS_CURVES_MOBILE : DEFAULT_RS_CURVES_DESKTOP
);

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

const randomSearchSpecificSliders: SliderConfig[] = [
  {
    label: '# Curves',
    model: rsCurves,
    min: MIN_RS_CURVES,
    max: MAX_RS_CURVES,
  },
];

// Computed slider configs based on solution method
// Desktop: common sliders first (closest to top buttons)
// Mobile: common sliders last (closest to bottom buttons)
const sliderConfigs = computed((): SliderConfig[] => {
  const mobile = isMobile();
  const specificSliders: SliderConfig[] = [];
  const speedAndPenalty: SliderConfig[] = [];

  // Get algorithm-specific sliders and speed/penalty
  switch (solutionMethod.value) {
    case 'genetic':
      specificSliders.push(...geneticSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'gradient':
      specificSliders.push(...gradientSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'adam':
      specificSliders.push(...adamSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'simulated-annealing':
      specificSliders.push(...saSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'particle-swarm':
      specificSliders.push(...psSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'momentum':
      specificSliders.push(...momentumSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'random-search':
      specificSliders.push(...randomSearchSpecificSliders);
      speedAndPenalty.push(speedSliderConfig.value, weightPenaltySliderConfig);
      break;
    case 'polynomial-solver':
      // Polynomial Solver: only common sliders
      return [...commonSliderConfigs];
    default:
      throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }

  // Order sliders based on device type
  if (mobile) {
    // Mobile: specific (with Learning Rate last), speed/penalty, then common (buttons are below)
    // Extract Learning Rate slider if it exists
    const learningRateIndex = specificSliders.findIndex(
      (s) => s.label === 'Learning Rate'
    );
    let learningRateSlider: SliderConfig | null = null;
    let otherSpecificSliders = specificSliders;

    if (learningRateIndex !== -1) {
      learningRateSlider = specificSliders[learningRateIndex];
      otherSpecificSliders = [
        ...specificSliders.slice(0, learningRateIndex),
        ...specificSliders.slice(learningRateIndex + 1),
      ];
    }

    // Build mobile order: other specific, learning rate, speed/penalty, common
    const mobileOrder: SliderConfig[] = [...otherSpecificSliders];
    if (learningRateSlider !== null) {
      mobileOrder.push(learningRateSlider);
    }
    mobileOrder.push(...speedAndPenalty, ...commonSliderConfigs);
    return mobileOrder;
  } else {
    // Desktop: common, specific, then speed/penalty (buttons are above)
    return [...commonSliderConfigs, ...specificSliders, ...speedAndPenalty];
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

const isAlgorithmSelectModalOpen = ref<boolean>(false);

const openAlgorithmSelectModal = (): void => {
  isAlgorithmSelectModalOpen.value = true;
};

const closeAlgorithmSelectModal = (): void => {
  isAlgorithmSelectModalOpen.value = false;
};

// Solution method state
const solutionMethod = ref<SolutionMethod>('gradient');

// Computed properties for current algorithm
const currentAlgoInfo = computed(() => getAlgoInfo(solutionMethod.value));
const currentAlgoColor = computed(() => currentAlgoInfo.value.color);

// Open algorithm selection modal (replaces cycling through algorithms)
const openAlgorithmModal = (): void => {
  openAlgorithmSelectModal();
};

// Select a specific algorithm from the modal
const selectAlgorithm = (algorithm: string): void => {
  solutionMethod.value = algorithm as SolutionMethod;

  stopEvolution();
  resetCurrentAlgorithm();
  startEvolution();
};

// Cycle to next algorithm (for the arrow button)
const nextAlgorithm = (): void => {
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

// Cycle to previous algorithm (for the back button)
const previousAlgorithm = (): void => {
  const currentIndex = ALGORITHM_ORDER.indexOf(solutionMethod.value);
  if (currentIndex === -1) {
    throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }

  // Move to previous algorithm (wrap around to end if at start)
  const prevIndex = (currentIndex - 1 + ALGORITHM_ORDER.length) % ALGORITHM_ORDER.length;
  solutionMethod.value = ALGORITHM_ORDER[prevIndex];

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

  // Reset the current algorithm when points change (old solutions are no longer valid)
  resetCurrentAlgorithm();
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

const resetRandomSearch = (): void => {
  // Generate initial set of random curves (global best + random candidates)
  const initialCurves: Curve[] = Array.from(
    { length: rsCurves.value + 1 }, // +1 for the global best
    (_value: unknown, i: number): Curve => ({
      id: i,
      weights: Array.from({ length: numWeights.value }, (): number => randomNormal(0, 1)),
      fitness: 0,
    })
  );
  curves.value = initialCurves;
  updateFitness();
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
    case 'random-search':
      resetRandomSearch();
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

  // Random Search parameters
  rsCurves.value = mobile ? DEFAULT_RS_CURVES_MOBILE : DEFAULT_RS_CURVES_DESKTOP;
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

// Perform one Random Search step
const randomSearchStep = (): void => {
  if (curves.value.length === 0) return;

  // Get current best
  const currentBest: Curve = curves.value[0];
  const currentBestFitness: number = calculateFitnessWithPenalty(currentBest);

  // Generate N random candidates
  const randomCandidates: Curve[] = Array.from(
    { length: rsCurves.value },
    (_value: unknown, i: number): Curve => ({
      id: i,
      weights: Array.from(
        { length: numWeights.value },
        () => randomNormal(0, 1) // Random weights: mean=0, stddev=1
      ),
      fitness: 0,
    })
  );

  // Calculate fitness for all candidates
  randomCandidates.forEach((candidate: Curve): void => {
    candidate.fitness = calculateBaseFitness(candidate);
  });

  // Find the best candidate from this batch
  let bestCandidate: Curve = randomCandidates[0];
  let bestCandidateFitness: number = calculateFitnessWithPenalty(bestCandidate);

  for (let i = 1; i < randomCandidates.length; i++) {
    const candidate = randomCandidates[i];
    const candidateFitness = calculateFitnessWithPenalty(candidate);
    if (candidateFitness < bestCandidateFitness) {
      bestCandidate = candidate;
      bestCandidateFitness = candidateFitness;
    }
  }

  // Update global best if we found something better
  let globalBest: Curve;
  if (bestCandidateFitness < currentBestFitness) {
    // New global best found!
    globalBest = { id: 0, weights: [...bestCandidate.weights], fitness: bestCandidate.fitness };
  } else {
    // Keep current global best
    globalBest = { id: 0, weights: [...currentBest.weights], fitness: currentBest.fitness };
  }

  // Re-ID the random candidates to start from 1 (0 is reserved for global best)
  randomCandidates.forEach((candidate: Curve, index: number): void => {
    candidate.id = index + 1;
  });

  // Display: global best first (cyan/highlighted), then all random candidates (gray)
  // Build new array to ensure reactivity
  const newCurves: Curve[] = [globalBest];
  randomCandidates.forEach((candidate: Curve): void => {
    newCurves.push(candidate);
  });
  curves.value = newCurves;
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
      case 'random-search':
        randomSearchStep();
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
  return index === 0 ? currentAlgoColor.value : OTHER_CURVE_COLOR;
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
      const fitnessText: string = `Fitness: ${generateScientificNotation(
        bestCurve.fitness,
        8
      )}`;
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ffffff'; // Always white
      ctx.textAlign = 'center';
      ctx.fillText(fitnessText, CANVAS_SIZE.value / 2, PADDING - 10);
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
  } else if (solutionMethod.value === 'random-search') {
    resetRandomSearch();
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
    } else if (solutionMethod.value === 'random-search') {
      resetRandomSearch();
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

// Regenerate random search when rsCurves changes
watch(rsCurves, (): void => {
  if (
    solutionMethod.value === 'random-search' &&
    curves.value.length > 0
  ) {
    resetRandomSearch();
  }
});
</script>

<template>
  <!-- BUILD TIMESTAMP FOR CACHE VERIFICATION -->
  <!-- <div class="fixed top-0 right-0 bg-green-600 text-white px-2 py-1 text-xs z-50">
    BUILD: 2025-11-16 00:20 UTC - SHORT NAMES ACTIVE
  </div> -->

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
          :thumbColor="currentAlgoColor"
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
          :thumbColor="currentAlgoColor"
        />
      </div>

      <!-- All Buttons -->
      <div class="mb-2 md:mb-3 flex flex-col gap-2 order-2 md:order-1">
        <!-- First Row: Info + Back + Algorithm Name + Next + Select -->
        <div class="flex items-center gap-2">
          <!-- Info Button -->
          <button
            @click="openInfoModal"
            class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
            style="filter: brightness(1)"
            @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
            @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
            @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            aria-label="Information"
            title="Learn more about this project"
          >
            <span class="text-lg md:text-base font-bold">i</span>
          </button>

          <!-- Previous Algorithm Button (Back) -->
          <button
            @click="previousAlgorithm"
            class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
            style="filter: brightness(1)"
            @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
            @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
            @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            aria-label="Previous Algorithm"
            title="Previous algorithm"
          >
            <span class="text-lg md:text-base font-bold"><</span>
          </button>

          <!-- Algorithm Name (Not clickable) -->
          <div
            class="flex-1 py-2 md:py-1 px-3 text-white text-center flex flex-col items-center justify-center"
          >
            <div class="text-xs md:text-xs opacity-80">{{ currentAlgoInfo.category }}</div>
            <div class="text-sm md:text-base font-bold">{{ currentAlgoInfo.name }}</div>
          </div>

          <!-- Next Algorithm Button -->
          <button
            @click="nextAlgorithm"
            class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
            style="filter: brightness(1)"
            @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
            @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
            @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            aria-label="Next Algorithm"
            title="Next algorithm"
          >
            <span class="text-lg md:text-base font-bold">></span>
          </button>

          <!-- Select Algorithm Button (Menu) -->
          <button
            @click="openAlgorithmModal"
            class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
            style="filter: brightness(1)"
            @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
            @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
            @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
            aria-label="Select Algorithm"
            title="Select algorithm"
          >
            <span class="text-lg md:text-base font-bold">^</span>
          </button>
        </div>

        <!-- Second Row: Reset/New Buttons -->
        <div class="flex items-stretch gap-2">
          <button
            @click="resetCurrentAlgorithm"
            class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
            :style="{ backgroundColor: currentAlgoColor }"
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
            :style="{ backgroundColor: currentAlgoColor }"
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
              solutionMethod !== 'particle-swarm' &&
              solutionMethod !== 'random-search')
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
            {{ generateScientificNotation(curve.fitness, 2) }}
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

    <!-- Algorithm Select Modal -->
    <AlgorithmSelectModal
      :isOpen="isAlgorithmSelectModalOpen"
      :currentAlgorithm="solutionMethod"
      @close="closeAlgorithmSelectModal"
      @select="selectAlgorithm"
    />
  </div>
</template>
