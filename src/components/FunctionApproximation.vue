<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue';
import ControlPanel from './ControlPanel.vue';
import WeightsTable from './WeightsTable.vue';
import AlgorithmControls from './AlgorithmControls.vue';
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
import { CONFIG } from '../config';

// ============================================================
// Reactive state
// ============================================================

const CANVAS_SIZE = ref<number>(500);

// Reactive state
const canvasRef = ref<HTMLCanvasElement | null>(null);
const allPoints = ref<Point[]>([]); // Full set of points (up to CONFIG.sliders.points.max)
const curves = ref<Curve[]>([]);
const numPoints = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.points : CONFIG.defaults.desktop.points
);
const numWeights = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.weights : CONFIG.defaults.desktop.weights
);
const numChildren = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.children : CONFIG.defaults.desktop.children
);
const generationsPerSec = ref<number>(
  CONFIG.utils.isMobile()
    ? CONFIG.defaults.mobile.speed
    : CONFIG.defaults.desktop.speed
);
const mutationVariance = ref<number>(
  CONFIG.utils.isMobile()
    ? CONFIG.defaults.mobile.mutationVariance
    : CONFIG.defaults.desktop.mutationVariance
);
const weightPenalty = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.weightPenalty : CONFIG.defaults.desktop.weightPenalty
);
const learningRate = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.learningRate : CONFIG.defaults.desktop.learningRate
);
const stochasticity = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.stochasticity : CONFIG.defaults.desktop.stochasticity
);
const adamLearningRate = ref<number>(
  CONFIG.utils.isMobile()
    ? CONFIG.defaults.mobile.adam.learningRate
    : CONFIG.defaults.desktop.adam.learningRate
);
const adamBeta1 = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.adam.beta1 : CONFIG.defaults.desktop.adam.beta1
);
const adamBeta2 = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.adam.beta2 : CONFIG.defaults.desktop.adam.beta2
);
const adamEpsilon = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.adam.epsilon : CONFIG.defaults.desktop.adam.epsilon
);
const saInitialTemp = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.simulatedAnnealing.initialTemp : CONFIG.defaults.desktop.simulatedAnnealing.initialTemp
);
const saCoolingRate = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.simulatedAnnealing.coolingRate : CONFIG.defaults.desktop.simulatedAnnealing.coolingRate
);
const saIterations = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.simulatedAnnealing.iterations : CONFIG.defaults.desktop.simulatedAnnealing.iterations
);
const psParticles = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.particleSwarm.particles : CONFIG.defaults.desktop.particleSwarm.particles
);
const psInertia = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.particleSwarm.inertia : CONFIG.defaults.desktop.particleSwarm.inertia
);
const psCognitive = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.particleSwarm.cognitive : CONFIG.defaults.desktop.particleSwarm.cognitive
);
const psSocial = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.particleSwarm.social : CONFIG.defaults.desktop.particleSwarm.social
);
const momentumLearningRate = ref<number>(
  CONFIG.utils.isMobile()
    ? CONFIG.defaults.mobile.momentum.learningRate
    : CONFIG.defaults.desktop.momentum.learningRate
);
const momentumBeta = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.momentum.beta : CONFIG.defaults.desktop.momentum.beta
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
const saBestLoss = ref<number>(Infinity);

// Particle Swarm state
const psParticlesState = ref<Particle[]>([]);
const psGlobalBestWeights = ref<number[]>([]);
const psGlobalBestLoss = ref<number>(Infinity);

// Momentum state
const momentumV = ref<number[]>([]); // Velocity

// Random Search state
const rsCurves = ref<number>(
  CONFIG.utils.isMobile() ? CONFIG.defaults.mobile.randomSearch.curves : CONFIG.defaults.desktop.randomSearch.curves
);

// Common slider configurations for both methods
const commonSliderConfigs: SliderConfig[] = [
  {
    label: '# Points',
    model: numPoints,
    min: CONFIG.sliders.points.min,
    max: CONFIG.sliders.points.max,
  },
  {
    label: '# Weights',
    model: numWeights,
    min: CONFIG.sliders.weights.min,
    max: CONFIG.sliders.weights.max,
  },
];

// Speed slider - different models for each method
const speedSliderConfig = computed((): SliderConfig => {
  return {
    label: 'Speed',
    model: generationsPerSec,
    min: CONFIG.sliders.speed.min,
    max: CONFIG.sliders.speed.max,
  };
});

// Weight Penalty slider - common configuration
const weightPenaltySliderConfig: SliderConfig = {
  label: '↑ Weight Penalty',
  model: weightPenalty,
  min: CONFIG.sliders.weightPenalty.min,
  max: CONFIG.sliders.weightPenalty.max,
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
    min: CONFIG.sliders.children.min,
    max: CONFIG.sliders.children.max,
  },
  {
    label: 'Mutation Variance',
    model: mutationVariance,
    min: CONFIG.sliders.mutationVariance.min,
    max: CONFIG.sliders.mutationVariance.max,
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
    min: CONFIG.sliders.learningRate.min,
    max: CONFIG.sliders.learningRate.max,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Stochasticity',
    model: stochasticity,
    min: CONFIG.sliders.stochasticity.min,
    max: CONFIG.sliders.stochasticity.max,
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
    min: CONFIG.sliders.adam.learningRate.min,
    max: CONFIG.sliders.adam.learningRate.max,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Beta1 (Momentum)',
    model: adamBeta1,
    min: CONFIG.sliders.adam.beta1.min,
    max: CONFIG.sliders.adam.beta1.max,
    step: 0.001,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Beta2 (RMSProp)',
    model: adamBeta2,
    min: CONFIG.sliders.adam.beta2.min,
    max: CONFIG.sliders.adam.beta2.max,
    step: 0.0001,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Epsilon',
    model: adamEpsilon,
    min: CONFIG.sliders.adam.epsilon.min,
    max: CONFIG.sliders.adam.epsilon.max,
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
    min: CONFIG.sliders.simulatedAnnealing.initialTemp.min,
    max: CONFIG.sliders.simulatedAnnealing.initialTemp.max,
    step: 0.1,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Cooling Rate',
    model: saCoolingRate,
    min: CONFIG.sliders.simulatedAnnealing.coolingRate.min,
    max: CONFIG.sliders.simulatedAnnealing.coolingRate.max,
    step: 0.0001,
    decimals: 4,
    useScientificNotation: true,
  },
  {
    label: 'Iterations/Temp',
    model: saIterations,
    min: CONFIG.sliders.simulatedAnnealing.iterations.min,
    max: CONFIG.sliders.simulatedAnnealing.iterations.max,
  },
];

// Particle Swarm specific sliders
const psSpecificSliders: SliderConfig[] = [
  {
    label: '# Particles',
    model: psParticles,
    min: CONFIG.sliders.particleSwarm.particles.min,
    max: CONFIG.sliders.particleSwarm.particles.max,
  },
  {
    label: 'Inertia',
    model: psInertia,
    min: CONFIG.sliders.particleSwarm.inertia.min,
    max: CONFIG.sliders.particleSwarm.inertia.max,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Cognitive',
    model: psCognitive,
    min: CONFIG.sliders.particleSwarm.cognitive.min,
    max: CONFIG.sliders.particleSwarm.cognitive.max,
    step: 0.01,
    decimals: 2,
    useScientificNotation: true,
  },
  {
    label: 'Social',
    model: psSocial,
    min: CONFIG.sliders.particleSwarm.social.min,
    max: CONFIG.sliders.particleSwarm.social.max,
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
    min: CONFIG.sliders.momentum.learningRate.min,
    max: CONFIG.sliders.momentum.learningRate.max,
    step: 0.0001,
    decimals: 2,
    logarithmic: true,
    logMidpoint: 0.01,
    useScientificNotation: true,
  },
  {
    label: 'Momentum (Beta)',
    model: momentumBeta,
    min: CONFIG.sliders.momentum.beta.min,
    max: CONFIG.sliders.momentum.beta.max,
    step: 0.001,
    decimals: 2,
    useScientificNotation: true,
  },
];

const randomSearchSpecificSliders: SliderConfig[] = [
  {
    label: '# Curves',
    model: rsCurves,
    min: CONFIG.sliders.randomSearch.curves.min,
    max: CONFIG.sliders.randomSearch.curves.max,
  },
];

// Computed slider configs based on solution method
// Desktop: common sliders first (closest to top buttons)
// Mobile: common sliders last (closest to bottom buttons)
const sliderConfigs = computed((): SliderConfig[] => {
  const mobile = CONFIG.utils.isMobile();
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
const currentAlgoInfo = computed(() => CONFIG.utils.getAlgoInfo(solutionMethod.value));
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
  const currentIndex = CONFIG.algorithmOrder.indexOf(solutionMethod.value);
  if (currentIndex === -1) {
    throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }

  // Move to next algorithm (wrap around to start if at end)
  const nextIndex = (currentIndex + 1) % CONFIG.algorithmOrder.length;
  solutionMethod.value = CONFIG.algorithmOrder[nextIndex];

  stopEvolution();
  resetCurrentAlgorithm();
  startEvolution();
};

// Cycle to previous algorithm (for the back button)
const previousAlgorithm = (): void => {
  const currentIndex = CONFIG.algorithmOrder.indexOf(solutionMethod.value);
  if (currentIndex === -1) {
    throw new Error(`Unknown solution method: ${solutionMethod.value}`);
  }

  // Move to previous algorithm (wrap around to end if at start)
  const prevIndex = (currentIndex - 1 + CONFIG.algorithmOrder.length) % CONFIG.algorithmOrder.length;
  solutionMethod.value = CONFIG.algorithmOrder[prevIndex];

  stopEvolution();
  resetCurrentAlgorithm();
  startEvolution();
};

// Computed: Get the first N points from allPoints based on slider
const points = computed((): Point[] => {
  return allPoints.value.slice(0, numPoints.value);
});

// Generate random points in coordinate system (generates full set up to CONFIG.sliders.points.max)
const generateRandomPoints = (): void => {
  const range: number = CONFIG.coordinates.max - CONFIG.coordinates.min;
  allPoints.value = Array.from(
    { length: CONFIG.sliders.points.max },
    (): Point => ({
      x: Math.random() * range + CONFIG.coordinates.min,
      y: Math.random() * range + CONFIG.coordinates.min,
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
      loss: 0,
    })
  );
  updateLoss();
};

// Generate single curve for gradient descent
const generateSingleCurve = (): void => {
  curves.value = [
    {
      id: 0,
      weights: Array.from({ length: numWeights.value }, (): number =>
        randomWeight()
      ),
      loss: 0,
    },
  ];
  updateLoss();
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
  saBestLoss.value = Infinity;
  generateSingleCurve();
};

const resetParticleSwarm = (): void => {
  psParticlesState.value = [];
  psGlobalBestWeights.value = [];
  psGlobalBestLoss.value = Infinity;
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
      loss: 0,
    })
  );
  curves.value = initialCurves;
  updateLoss();
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
  const mobile = CONFIG.utils.isMobile();

  // Common parameters
  numPoints.value = mobile
    ? CONFIG.defaults.mobile.points
    : CONFIG.defaults.desktop.points;
  numWeights.value = mobile
    ? CONFIG.defaults.mobile.weights
    : CONFIG.defaults.desktop.weights;
  generationsPerSec.value = mobile
    ? CONFIG.defaults.mobile.speed
    : CONFIG.defaults.desktop.speed;
  weightPenalty.value = mobile
    ? CONFIG.defaults.mobile.weightPenalty
    : CONFIG.defaults.desktop.weightPenalty;

  // Genetic Algorithm parameters
  numChildren.value = mobile
    ? CONFIG.defaults.mobile.children
    : CONFIG.defaults.desktop.children;
  mutationVariance.value = mobile
    ? CONFIG.defaults.mobile.mutationVariance
    : CONFIG.defaults.desktop.mutationVariance;

  // Gradient Descent parameters
  learningRate.value = mobile
    ? CONFIG.defaults.mobile.learningRate
    : CONFIG.defaults.desktop.learningRate;
  stochasticity.value = mobile
    ? CONFIG.defaults.mobile.stochasticity
    : CONFIG.defaults.desktop.stochasticity;

  // Adam Optimizer parameters
  adamLearningRate.value = mobile
    ? CONFIG.defaults.mobile.adam.learningRate
    : CONFIG.defaults.desktop.adam.learningRate;
  adamBeta1.value = mobile
    ? CONFIG.defaults.mobile.adam.beta1
    : CONFIG.defaults.desktop.adam.beta1;
  adamBeta2.value = mobile
    ? CONFIG.defaults.mobile.adam.beta2
    : CONFIG.defaults.desktop.adam.beta2;
  adamEpsilon.value = mobile
    ? CONFIG.defaults.mobile.adam.epsilon
    : CONFIG.defaults.desktop.adam.epsilon;

  // Simulated Annealing parameters
  saInitialTemp.value = mobile
    ? CONFIG.defaults.mobile.simulatedAnnealing.initialTemp
    : CONFIG.defaults.desktop.simulatedAnnealing.initialTemp;
  saCoolingRate.value = mobile
    ? CONFIG.defaults.mobile.simulatedAnnealing.coolingRate
    : CONFIG.defaults.desktop.simulatedAnnealing.coolingRate;
  saIterations.value = mobile
    ? CONFIG.defaults.mobile.simulatedAnnealing.iterations
    : CONFIG.defaults.desktop.simulatedAnnealing.iterations;

  // Particle Swarm parameters
  psParticles.value = mobile
    ? CONFIG.defaults.mobile.particleSwarm.particles
    : CONFIG.defaults.desktop.particleSwarm.particles;
  psInertia.value = mobile
    ? CONFIG.defaults.mobile.particleSwarm.inertia
    : CONFIG.defaults.desktop.particleSwarm.inertia;
  psCognitive.value = mobile
    ? CONFIG.defaults.mobile.particleSwarm.cognitive
    : CONFIG.defaults.desktop.particleSwarm.cognitive;
  psSocial.value = mobile
    ? CONFIG.defaults.mobile.particleSwarm.social
    : CONFIG.defaults.desktop.particleSwarm.social;

  // Momentum-Based GD parameters
  momentumLearningRate.value = mobile
    ? CONFIG.defaults.mobile.momentum.learningRate
    : CONFIG.defaults.desktop.momentum.learningRate;
  momentumBeta.value = mobile
    ? CONFIG.defaults.mobile.momentum.beta
    : CONFIG.defaults.desktop.momentum.beta;

  // Random Search parameters
  rsCurves.value = mobile ? CONFIG.defaults.mobile.randomSearch.curves : CONFIG.defaults.desktop.randomSearch.curves;
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
  if (CONFIG.mutation.distributionType === 'uniform') {
    return randomUniform(value, variance);
  } else {
    return randomNormal(value, variance);
  }
};

// Calculate adaptive variance scale based on loss
// Low loss (good) -> low scale (fine-tuning)
// High loss (bad) -> high scale (exploration)
const getAdaptiveVarianceScale = (loss: number): number => {
  if (!CONFIG.mutation.adaptiveVariance.enabled) {
    return 1.0;
  }

  // Use square root scaling: scale = sqrt(loss / target)
  const rawScale: number = Math.sqrt(
    loss / CONFIG.mutation.adaptiveVariance.lossTarget
  );

  // Clamp to min/max range
  return Math.max(
    CONFIG.mutation.adaptiveVariance.minScale,
    Math.min(CONFIG.mutation.adaptiveVariance.maxScale, rawScale)
  );
};

// Calculate weight-proportional variance scale based on weight magnitude
// Larger weights (absolute value) -> larger variance
// Smaller weights -> smaller variance
const getWeightProportionalScale = (weight: number): number => {
  if (!CONFIG.mutation.weightProportional.enabled) {
    return 1.0;
  }

  const absWeight: number = Math.abs(weight);
  // Scale = min + (absWeight * factor)
  // This gives proportional scaling with a minimum baseline
  return (
    CONFIG.mutation.weightProportional.min +
    absWeight * CONFIG.mutation.weightProportional.factor
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

  updateLoss();
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

  updateLoss();
};

// Perform one Simulated Annealing step
const simulatedAnnealingStep = (): void => {
  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;

  // Initialize if needed
  if (saCurrentBest.value === null) {
    saCurrentBest.value = [...curve.weights];
    saBestLoss.value = curve.loss;
    saTemperature.value = saInitialTemp.value;
  }

  for (let iter = 0; iter < saIterations.value; iter++) {
    // Generate neighbor solution by perturbing random weight
    const newWeights: number[] = [...curve.weights];
    const randomIndex: number = Math.floor(Math.random() * newWeights.length);
    const perturbation: number = randomNormal(0, saTemperature.value);
    newWeights[randomIndex] += perturbation;

    // Evaluate new solution
    const newCurve: Curve = { id: 0, weights: newWeights, loss: 0 };
    newCurve.loss = calculateBaseLoss(newCurve);

    // Calculate loss with penalty
    const currentLoss: number = calculateLossWithPenalty(curve);
    const newLoss: number =
      newCurve.loss + calculateWeightPenalty(newCurve);

    // Accept or reject based on Metropolis criterion
    const delta: number = newLoss - currentLoss;
    if (delta < 0 || Math.random() < Math.exp(-delta / saTemperature.value)) {
      // Accept new solution
      curve.weights = newWeights;
      curve.loss = newCurve.loss;

      // Update best if improved
      if (newCurve.loss < saBestLoss.value) {
        saCurrentBest.value = [...newWeights];
        saBestLoss.value = newCurve.loss;
      }
    }
  }

  // Cool down temperature
  saTemperature.value *= saCoolingRate.value;

  updateLoss();
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

// Solve polynomial using linear algebra (exact or least-squares fit)
const solvePolynomialExact = (): void => {
  if (curves.value.length === 0) return;
  const curve: Curve = curves.value[0]!;

  const n = numWeights.value; // Number of coefficients to solve for
  const m = numPoints.value;  // Number of data points

  // Build Vandermonde matrix A and vector b
  // A[i][j] = x_i^j (x to the power j)
  // b[i] = y_i
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(Math.pow(points.value[i].x, j));
    }
    A.push(row);
    b.push(points.value[i].y);
  }

  let solution: number[] | null = null;

  if (m >= n) {
    // More points than weights (or equal): use least-squares via Normal Equations
    // Solve (A^T * A) * x = A^T * b
    const AtA: number[][] = [];
    const Atb: number[] = [];

    // Compute A^T * A (n x n matrix)
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < m; k++) {
          sum += A[k][i] * A[k][j];
        }
        row.push(sum);
      }
      AtA.push(row);
    }

    // Compute A^T * b (n x 1 vector)
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let k = 0; k < m; k++) {
        sum += A[k][i] * b[k];
      }
      Atb.push(sum);
    }

    solution = gaussianElimination(AtA, Atb);
  } else {
    // Fewer points than weights: use only as many coefficients as we have points
    const reducedA: number[][] = [];
    for (let i = 0; i < m; i++) {
      reducedA.push(A[i].slice(0, m));
    }
    solution = gaussianElimination(reducedA, b);
  }

  if (solution !== null) {
    // Set the weights from solution
    for (let i = 0; i < numWeights.value; i++) {
      if (i < solution.length) {
        curve.weights[i] = solution[i];
      } else {
        // Set extra weights to zero
        curve.weights[i] = 0;
      }
    }

    curve.loss = calculateBaseLoss(curve);
  }

  updateLoss();
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

  updateLoss();
};

// Perform one Random Search step
const randomSearchStep = (): void => {
  if (curves.value.length === 0) return;

  // Get current best
  const currentBest: Curve = curves.value[0];
  const currentBestLoss: number = calculateLossWithPenalty(currentBest);

  // Generate N random candidates
  const randomCandidates: Curve[] = Array.from(
    { length: rsCurves.value },
    (_value: unknown, i: number): Curve => ({
      id: i,
      weights: Array.from(
        { length: numWeights.value },
        () => randomNormal(0, 1) // Random weights: mean=0, stddev=1
      ),
      loss: 0,
    })
  );

  // Calculate loss for all candidates
  randomCandidates.forEach((candidate: Curve): void => {
    candidate.loss = calculateBaseLoss(candidate);
  });

  // Find the best candidate from this batch
  let bestCandidate: Curve = randomCandidates[0];
  let bestCandidateLoss: number = calculateLossWithPenalty(bestCandidate);

  for (let i = 1; i < randomCandidates.length; i++) {
    const candidate = randomCandidates[i];
    const candidateLoss = calculateLossWithPenalty(candidate);
    if (candidateLoss < bestCandidateLoss) {
      bestCandidate = candidate;
      bestCandidateLoss = candidateLoss;
    }
  }

  // Update global best if we found something better
  let globalBest: Curve;
  if (bestCandidateLoss < currentBestLoss) {
    // New global best found!
    globalBest = { id: 0, weights: [...bestCandidate.weights], loss: bestCandidate.loss };
  } else {
    // Keep current global best
    globalBest = { id: 0, weights: [...currentBest.weights], loss: currentBest.loss };
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
        bestLoss: Infinity,
      };
    }
  );

  psGlobalBestWeights.value = [];
  psGlobalBestLoss.value = Infinity;

  // Evaluate initial particles
  psParticlesState.value.forEach((particle: Particle): void => {
    const curve: Curve = { id: 0, weights: particle.weights, loss: 0 };
    curve.loss = calculateBaseLoss(curve);
    const loss: number = curve.loss + calculateWeightPenalty(curve);

    particle.bestLoss = loss;

    if (loss < psGlobalBestLoss.value) {
      psGlobalBestLoss.value = loss;
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
      loss: calculateBaseLoss({
        id: 0,
        weights: particle.weights,
        loss: 0,
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
    const curve: Curve = { id: 0, weights: particle.weights, loss: 0 };
    curve.loss = calculateBaseLoss(curve);
    const loss: number = curve.loss + calculateWeightPenalty(curve);

    // Update personal best
    if (loss < particle.bestLoss) {
      particle.bestLoss = loss;
      particle.bestWeights = [...particle.weights];
    }

    // Update global best
    if (loss < psGlobalBestLoss.value) {
      psGlobalBestLoss.value = loss;
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

  // Calculate adaptive variance scale based on best loss
  const adaptiveScale: number = getAdaptiveVarianceScale(bestCurve.loss);

  curves.value = Array.from(
    { length: numChildren.value },
    (_value: unknown, i: number): Curve => {
      // Calculate base variance for this index (min to max range)
      const varianceFactor: number = Math.pow(
        i / (numChildren.value - 1),
        CONFIG.mutation.varianceExponent
      );
      const baseVariance: number =
        CONFIG.mutation.minVariance +
        varianceFactor * (mutationVariance.value - CONFIG.mutation.minVariance);

      // Apply adaptive scaling to base variance
      const adaptiveVariance: number = baseVariance * adaptiveScale;

      // Apply mutations to each weight
      const mutatedWeights: number[] = bestCurve.weights.map(
        (weight: number, weightIndex: number): number => {
          // Get variance scale for this weight (default to 1.0 if not specified)
          const varianceScale: number =
            CONFIG.mutation.weightVarianceScales[weightIndex] ?? 1.0;

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
        loss: 0,
      };
    }
  );

  updateLoss();
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

// Calculate base loss (Mean Squared Error only - lower is better)
const calculateBaseLoss = (curve: Curve): number => {
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

// Calculate loss with weight penalty for selection within a generation
const calculateLossWithPenalty = (curve: Curve): number => {
  return curve.loss + calculateWeightPenalty(curve);
};

// Update loss for all curves (stores base MSE only)
const updateLoss = (): void => {
  curves.value.forEach((curve: Curve): void => {
    curve.loss = calculateBaseLoss(curve);
  });
};

// Get sorted curves by loss with weight penalty applied for selection (best first)
const sortedCurves = computed((): Curve[] => {
  return [...curves.value].sort(
    (a: Curve, b: Curve): number =>
      calculateLossWithPenalty(a) - calculateLossWithPenalty(b)
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
  const isMobile: boolean = viewportWidth < CONFIG.canvas.mobileBreakpoint;

  const heightOffset: number = isMobile
    ? CONFIG.canvas.viewportHeightOffsetMobile
    : CONFIG.canvas.viewportHeightOffset;
  const widthOffset: number = isMobile
    ? CONFIG.canvas.viewportWidthOffsetMobile
    : CONFIG.canvas.viewportWidthOffset;
  const minSize: number = isMobile ? CONFIG.canvas.minSizeMobile : CONFIG.canvas.minSize;

  const availableHeight: number = viewportHeight - heightOffset;
  const availableWidth: number = viewportWidth - widthOffset;
  const size: number = Math.min(availableHeight, availableWidth);
  CANVAS_SIZE.value = Math.max(minSize, Math.floor(size));
};

// Convert coordinates from coordinate system range to canvas coordinates
const toCanvasCoords = (x: number, y: number): CanvasCoords => {
  const size: number = CANVAS_SIZE.value - 2 * CONFIG.canvas.padding;
  const range: number = CONFIG.coordinates.max - CONFIG.coordinates.min;
  return {
    cx: CONFIG.canvas.padding + ((x - CONFIG.coordinates.min) * size) / range,
    cy: CANVAS_SIZE.value - CONFIG.canvas.padding - ((y - CONFIG.coordinates.min) * size) / range,
  };
};

// Convert canvas coordinates back to coordinate system values
const toCoordSystemCoords = (cx: number, cy: number): CoordSystemCoords => {
  const size: number = CANVAS_SIZE.value - 2 * CONFIG.canvas.padding;
  const range: number = CONFIG.coordinates.max - CONFIG.coordinates.min;
  return {
    x: CONFIG.coordinates.min + ((cx - CONFIG.canvas.padding) * range) / size,
    y: CONFIG.coordinates.min + ((CANVAS_SIZE.value - CONFIG.canvas.padding - cy) * range) / size,
  };
};

// Get color for curve based on rank
const getCurveColor = (index: number): string => {
  return index === 0 ? currentAlgoColor.value : CONFIG.colors.drawing.otherCurve;
};

// Find point at given canvas position (returns index or null)
const getPointAtPosition = (cx: number, cy: number): number | null => {
  const hitRadius: number = CONFIG.drawing.pointRadius + 5; // Slightly larger hit area

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
    const clampedX: number = Math.max(CONFIG.coordinates.min, Math.min(CONFIG.coordinates.max, coords.x));
    const clampedY: number = Math.max(CONFIG.coordinates.min, Math.min(CONFIG.coordinates.max, coords.y));

    // Update the point in allPoints array
    allPoints.value[draggingPointIndex.value] = {
      x: clampedX,
      y: clampedY,
    };

    // Update loss calculations
    updateLoss();
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
    const clampedX: number = Math.max(CONFIG.coordinates.min, Math.min(CONFIG.coordinates.max, coords.x));
    const clampedY: number = Math.max(CONFIG.coordinates.min, Math.min(CONFIG.coordinates.max, coords.y));

    // Update the point in allPoints array
    allPoints.value[draggingPointIndex.value] = {
      x: clampedX,
      y: clampedY,
    };

    // Update loss calculations
    updateLoss();
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
  ctx.setTransform(CONFIG.canvas.scale, 0, 0, CONFIG.canvas.scale, 0, 0);

  // Clear canvas
  ctx.fillStyle = CONFIG.colors.canvas.background;
  ctx.fillRect(0, 0, CANVAS_SIZE.value, CANVAS_SIZE.value);

  // Draw grid
  ctx.strokeStyle = CONFIG.colors.canvas.grid;
  ctx.lineWidth = CONFIG.drawing.grid.lineWidth;
  for (let i: number = 0; i <= 10; i++) {
    const pos: number = CONFIG.canvas.padding + (i / 10) * (CANVAS_SIZE.value - 2 * CONFIG.canvas.padding);

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(pos, CONFIG.canvas.padding);
    ctx.lineTo(pos, CANVAS_SIZE.value - CONFIG.canvas.padding);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(CONFIG.canvas.padding, pos);
    ctx.lineTo(CANVAS_SIZE.value - CONFIG.canvas.padding, pos);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = CONFIG.colors.canvas.axes;
  ctx.lineWidth = CONFIG.drawing.axes.lineWidth;

  // X-axis
  ctx.beginPath();
  const originCoords: CanvasCoords = toCanvasCoords(0, 0);
  ctx.moveTo(CONFIG.canvas.padding, originCoords.cy);
  ctx.lineTo(CANVAS_SIZE.value - CONFIG.canvas.padding, originCoords.cy);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(originCoords.cx, CONFIG.canvas.padding);
  ctx.lineTo(originCoords.cx, CANVAS_SIZE.value - CONFIG.canvas.padding);
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
        ctx.lineWidth = isPrimary ? CONFIG.drawing.curves.bestLineWidth : CONFIG.drawing.curves.otherLineWidth;
        ctx.globalAlpha = isPrimary ? 1.0 : CONFIG.drawing.curves.otherOpacity;
        ctx.beginPath();

        // Extend drawing range horizontally beyond visible area
        const drawMin: number = CONFIG.coordinates.min - CONFIG.coordinates.curveHorizontalOverdraw;
        const drawMax: number = CONFIG.coordinates.max + CONFIG.coordinates.curveHorizontalOverdraw;
        const range: number = drawMax - drawMin;

        // Use higher resolution for primary curve, lower for auxiliary curves
        const resolution: number = isPrimary ? CONFIG.canvas.curveResolution.primary : CONFIG.canvas.curveResolution.auxiliary;

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
      ctx.strokeStyle = CONFIG.colors.canvas.errorBars;
      ctx.lineWidth = CONFIG.drawing.errorBars.lineWidth;

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

    ctx.fillStyle = CONFIG.colors.points.darkGray;
    ctx.beginPath();
    ctx.arc(coords.cx, coords.cy, CONFIG.drawing.pointRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = CONFIG.colors.canvas.pointBorder;
    ctx.lineWidth = CONFIG.drawing.dot.borderWidth;
    ctx.stroke();
  });

  // Draw labels
  ctx.fillStyle = CONFIG.colors.canvas.labels;
  ctx.font = '12px monospace';
  const center: number = CONFIG.canvas.padding + (CANVAS_SIZE.value - 2 * CONFIG.canvas.padding) / 2;

  // X-axis labels
  ctx.fillText(
    CONFIG.coordinates.min.toString(),
    CONFIG.canvas.padding - 15,
    CANVAS_SIZE.value - CONFIG.canvas.padding + 15
  );
  ctx.fillText('0', center - 5, CANVAS_SIZE.value - CONFIG.canvas.padding + 15);
  ctx.fillText(
    CONFIG.coordinates.max.toString(),
    CANVAS_SIZE.value - CONFIG.canvas.padding - 5,
    CANVAS_SIZE.value - CONFIG.canvas.padding + 15
  );

  // Y-axis labels
  ctx.fillText(
    CONFIG.coordinates.min.toString(),
    CONFIG.canvas.padding - 20,
    CANVAS_SIZE.value - CONFIG.canvas.padding + 5
  );
  ctx.fillText('0', CONFIG.canvas.padding - 15, center + 5);
  ctx.fillText(CONFIG.coordinates.max.toString(), CONFIG.canvas.padding - 15, CONFIG.canvas.padding + 5);

  // Display loss above graph area (drawn last so it's on top)
  if (!hasNoSolution) {
    const bestCurve: Curve | null = getBestCurve();
    if (bestCurve !== null) {
      const lossText: string = `Loss: ${generateScientificNotation(
        bestCurve.loss,
        8
      )}`;
      ctx.font = '14px monospace';
      ctx.fillStyle = '#ffffff'; // Always white
      ctx.textAlign = 'center';
      ctx.fillText(lossText, CANVAS_SIZE.value / 2, CONFIG.canvas.padding - 10);
      ctx.textAlign = 'left'; // Reset to default
    }
  }

  // Draw "No Solution" message on top of everything if needed
  if (hasNoSolution) {
    ctx.fillStyle = CONFIG.colors.tailwind.pink500;
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

// Update loss when numPoints changes (points auto-updates via computed)
watch(numPoints, (): void => {
  if (allPoints.value.length > 0) {
    if (solutionMethod.value === 'polynomial-solver') {
      solvePolynomialExact();
    } else {
      updateLoss();
    }
  }
});

// Regenerate curves when numWeights changes
watch(numWeights, (): void => {
  if (curves.value.length > 0) {
    if (solutionMethod.value === 'genetic') {
      generateCurves();
    } else if (solutionMethod.value === 'random-search') {
      resetRandomSearch();
    } else if (solutionMethod.value === 'polynomial-solver') {
      generateSingleCurve();
      solvePolynomialExact();
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
    zzz
  </div> -->

  <div
    class="h-screen-mobile flex flex-col md:flex-row gap-0 md:gap-4 justify-center items-stretch flex-1 overflow-hidden p-0 md:p-0"
  >
    <div
      class="w-full md:w-[600px] md:min-w-0 flex flex-col text-left p-2 md:p-3 bg-ui-bg md:rounded-lg border-0 md:border-2 border-ui-border overflow-y-auto md:overflow-y-auto order-2 md:order-1 md:shrink shrink-0"
    >
      <!-- Control Panel (Sliders) -->
      <ControlPanel
        :sliderConfigs="sliderConfigs"
        :thumbColor="currentAlgoColor"
      />

      <!-- Algorithm Controls (Buttons) -->
      <AlgorithmControls
        :currentAlgoInfo="currentAlgoInfo"
        :currentAlgoColor="currentAlgoColor"
        :pointsColor="CONFIG.colors.points.darkGray"
        @info="openInfoModal"
        @previous="previousAlgorithm"
        @next="nextAlgorithm"
        @selectAlgorithm="openAlgorithmModal"
        @reset="resetCurrentAlgorithm"
        @resetParams="resetParameters"
        @newPoints="generateRandomPoints"
      />

      <!-- Weights Table -->
      <WeightsTable
        :sortedCurves="sortedCurves"
        :numWeights="numWeights"
        :solutionMethod="solutionMethod"
        :formatScientific="generateScientificNotation"
      />
    </div>

    <!-- Canvas Display -->
    <canvas
      ref="canvasRef"
      :width="CANVAS_SIZE * CONFIG.canvas.scale"
      :height="CANVAS_SIZE * CONFIG.canvas.scale"
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
