<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import Slider from './Slider.vue';
import Formula from './Formula.vue';
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

// ============================================================
// Configuration
// ============================================================

const TAILWIND_RED_500: string = '#fb2c36';
const TAILWIND_GREEN_600: string = '#16a34a';
const TAILWIND_BLUE_500: string = '#3b82f6';
const TAILWIND_YELLOW_600: string = '#ca8a04';

// Slider Ranges
const MIN_POINTS: number = 1;
const MAX_POINTS: number = 16;
const DEFAULT_NUM_POINTS_DESKTOP: number = 5;
const DEFAULT_NUM_POINTS_MOBILE: number = 5;

const MIN_WEIGHTS: number = 1;
const MAX_WEIGHTS: number = 36;
const DEFAULT_NUM_WEIGHTS_DESKTOP: number = 16;
const DEFAULT_NUM_WEIGHTS_MOBILE: number = 16;

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

// Point and Curve Generation
const POINT_RADIUS: number = 8; // Size of data points on canvas

// Dot/Point Colors (for canvas points and slider thumbs) - dynamic based on method
const getDotColor = (): string => {
  if (solutionMethod.value === 'genetic') return TAILWIND_GREEN_600;
  if (solutionMethod.value === 'gradient') return TAILWIND_BLUE_500;
  return TAILWIND_YELLOW_600;
};
const DOT_BORDER_COLOR: string = '#ffffff';
const DOT_BORDER_WIDTH: number = 3;

// Curve Drawing Styles - dynamic based on method
const BEST_CURVE_LINE_WIDTH: number = 5;
const getBestCurveColor = (): string => {
  if (solutionMethod.value === 'genetic') return TAILWIND_GREEN_600;
  if (solutionMethod.value === 'gradient') return TAILWIND_BLUE_500;
  return TAILWIND_YELLOW_600;
};
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

// Curve Drawing
const CURVE_RESOLUTION: number = 200; // Number of points to draw curves

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
const adamLearningRate = ref<number>(
  isMobile() ? DEFAULT_ADAM_LEARNING_RATE_MOBILE : DEFAULT_ADAM_LEARNING_RATE_DESKTOP
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
let animationFrameId: number | null = null;
let lastFrameTime: number = 0;
let generationAccumulator: number = 0;

// Adam optimizer state (moment estimates)
const adamM = ref<number[]>([]);  // First moment (mean)
const adamV = ref<number[]>([]);  // Second moment (variance)
const adamT = ref<number>(0);     // Time step

// Common slider configurations for both methods
const commonSliderConfigs = [
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
const speedSliderConfig = computed(() => {
  return {
    label: 'Speed',
    model: generationsPerSec,
    min: MIN_GENERATIONS_PER_SEC,
    max: MAX_GENERATIONS_PER_SEC,
  };
});

// Weight Penalty slider - common configuration
const weightPenaltySliderConfig = {
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
const geneticSpecificSliders = [
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
const gradientSpecificSliders = [
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
];

// Adam Optimizer specific sliders
const adamSpecificSliders = [
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

// Computed slider configs based on solution method
const sliderConfigs = computed(() => {
  let specificSliders;
  if (solutionMethod.value === 'genetic') {
    specificSliders = geneticSpecificSliders;
  } else if (solutionMethod.value === 'gradient') {
    specificSliders = gradientSpecificSliders;
  } else {
    specificSliders = adamSpecificSliders;
  }
  // Reverse order: specific sliders first, then common sliders at bottom
  return [
    ...specificSliders,
    weightPenaltySliderConfig,
    speedSliderConfig.value,
    ...commonSliderConfigs.slice().reverse(),
  ];
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
type SolutionMethod = 'genetic' | 'gradient' | 'adam';
const solutionMethod = ref<SolutionMethod>('genetic');

const toggleSolutionMethod = (): void => {
  // Cycle through: genetic -> gradient -> adam -> genetic
  if (solutionMethod.value === 'genetic') {
    solutionMethod.value = 'gradient';
  } else if (solutionMethod.value === 'gradient') {
    solutionMethod.value = 'adam';
  } else {
    solutionMethod.value = 'genetic';
  }

  stopEvolution();
  if (solutionMethod.value === 'genetic') {
    generateCurves();
  } else {
    generateSingleCurve();
    // Reset Adam state when switching to Adam
    if (solutionMethod.value === 'adam') {
      adamM.value = [];
      adamV.value = [];
      adamT.value = 0;
    }
  }
  startEvolution();
};

const solutionMethodTitle = computed((): string => {
  if (solutionMethod.value === 'genetic') return 'Genetic Algorithm';
  if (solutionMethod.value === 'gradient') return 'Gradient Descent';
  return 'Adam Optimizer';
});

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
  if (curves.value.length === 0) return;

  const curve: Curve = curves.value[0]!;
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

  // Add L2 regularization gradient: d(penalty)/d(w_i) = 2 * lambda * w_i
  // where lambda is the weightPenalty value
  if (weightPenalty.value > 0) {
    for (let i: number = 0; i < curve.weights.length; i++) {
      gradients[i] += 2 * weightPenalty.value * curve.weights[i];
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
    adamM.value[i] = adamBeta1.value * adamM.value[i] + (1 - adamBeta1.value) * gradients[i];

    // Update biased second moment estimate
    adamV.value[i] = adamBeta2.value * adamV.value[i] + (1 - adamBeta2.value) * gradients[i] * gradients[i];

    // Compute bias-corrected first moment estimate
    const mHat: number = adamM.value[i] / (1 - Math.pow(adamBeta1.value, adamT.value));

    // Compute bias-corrected second moment estimate
    const vHat: number = adamV.value[i] / (1 - Math.pow(adamBeta2.value, adamT.value));

    // Update weight
    return weight - adamLearningRate.value * mHat / (Math.sqrt(vHat) + adamEpsilon.value);
  });

  updateFitness();
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

  if (solutionMethod.value === 'genetic') {
    // Accumulate generations to run based on desired rate
    generationAccumulator += deltaTime * generationsPerSec.value;

    // Run as many generations as accumulated (can be 0, 1, or multiple)
    while (generationAccumulator >= 1) {
      generateCurvesFromBest();
      generationAccumulator -= 1;
    }
  } else {
    // Gradient descent or Adam mode
    generationAccumulator += deltaTime * generationsPerSec.value;

    // Run as many iterations as accumulated
    while (generationAccumulator >= 1) {
      if (solutionMethod.value === 'gradient') {
        gradientDescentStep();
      } else {
        adamStep();
      }
      generationAccumulator -= 1;
    }
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
  return index === 0 ? getBestCurveColor() : OTHER_CURVE_COLOR;
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

  // Draw all polynomial curves (worst to best so best is on top)
  sortedCurves.value
    .slice()
    .reverse()
    .forEach((curve: Curve, index: number): void => {
      const rankIndex: number = sortedCurves.value.length - 1 - index;
      ctx.strokeStyle = getCurveColor(rankIndex);
      ctx.lineWidth =
        rankIndex === 0 ? BEST_CURVE_LINE_WIDTH : OTHER_CURVE_LINE_WIDTH;
      ctx.globalAlpha = rankIndex === 0 ? 1.0 : OTHER_CURVE_OPACITY;
      ctx.beginPath();

      // Extend drawing range horizontally beyond visible area
      const drawMin: number = COORD_MIN - CURVE_HORIZONTAL_OVERDRAW;
      const drawMax: number = COORD_MAX + CURVE_HORIZONTAL_OVERDRAW;
      const range: number = drawMax - drawMin;

      for (let i: number = 0; i <= CURVE_RESOLUTION; i++) {
        const x: number = drawMin + (i / CURVE_RESOLUTION) * range;
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

  // Draw points
  points.value.forEach((point: Point): void => {
    const coords: CanvasCoords = toCanvasCoords(point.x, point.y);

    ctx.fillStyle = getDotColor();
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
  if (curves.value.length > 0) {
    generateCurves();
  }
});
</script>

<template>
  <div
    class="h-screen md:h-auto flex flex-col md:flex-row gap-0 md:gap-4 justify-center items-stretch flex-1 overflow-hidden p-0 md:p-0"
  >
    <div
      class="w-full md:w-[600px] md:min-w-0 flex flex-col text-left p-2 md:p-3 bg-ui-bg md:rounded-lg border-0 md:border-2 border-ui-border overflow-y-auto md:overflow-y-auto order-2 md:order-1 md:shrink shrink-0"
    >
      <!-- Sliders -->
      <div class="mb-2 md:mb-3 flex flex-col gap-1.5 md:gap-2">
        <Slider
          v-for="(config, index) in sliderConfigs"
          :key="index"
          :label="config.label"
          v-model="config.model.value"
          :min="config.min"
          :max="config.max"
          :step="config.step"
          :decimals="config.decimals"
          :logarithmic="config.logarithmic"
          :logMidpoint="config.logMidpoint"
          :useScientificNotation="config.useScientificNotation"
          :thumbColor="getDotColor()"
        />
      </div>

      <!-- All Buttons -->
      <div class="mb-2 md:mb-3 flex items-stretch gap-2">
        <button
          @click="openInfoModal"
          class="w-8 h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all hover:bg-gray-500 active:translate-y-px shrink-0 self-center"
          aria-label="Information"
          title="Learn more about this project"
        >
          <span class="text-sm font-bold">i</span>
        </button>
        <button
          @click="toggleSolutionMethod"
          class="flex-1 py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all active:translate-y-px text-center flex flex-col items-center justify-center"
          :style="{ backgroundColor: getDotColor() }"
          @mouseover="$event.currentTarget.style.filter = 'brightness(0.9)'"
          @mouseout="$event.currentTarget.style.filter = 'brightness(1)'"
          :title="`Switch to ${solutionMethod === 'genetic' ? 'Gradient Descent' : 'Genetic Algorithm'}`"
        >
          <span v-if="solutionMethod === 'genetic'">Genetic</span>
          <span v-else-if="solutionMethod === 'gradient'">Gradient</span>
          <span v-else>Adam</span>
          <span v-if="solutionMethod === 'genetic'">Algorithm</span>
          <span v-else-if="solutionMethod === 'gradient'">Descent</span>
          <span v-else>Optimizer</span>
        </button>
        <button
          v-if="solutionMethod === 'genetic'"
          @click="generateCurves"
          class="flex-1 py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all active:translate-y-px flex flex-col items-center justify-center"
          :style="{ backgroundColor: getDotColor(), '&:hover': { filter: 'brightness(0.9)' } }"
          @mouseover="$event.currentTarget.style.filter = 'brightness(0.9)'"
          @mouseout="$event.currentTarget.style.filter = 'brightness(1)'"
        >
          <span>New</span>
          <span>Curves</span>
        </button>
        <button
          v-else
          @click="generateSingleCurve"
          class="flex-1 py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all active:translate-y-px flex flex-col items-center justify-center"
          :style="{ backgroundColor: getDotColor() }"
          @mouseover="$event.currentTarget.style.filter = 'brightness(0.9)'"
          @mouseout="$event.currentTarget.style.filter = 'brightness(1)'"
        >
          <span>New</span>
          <span>Curve</span>
        </button>
        <button
          @click="generateRandomPoints"
          class="flex-1 py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all active:translate-y-px flex flex-col items-center justify-center"
          :style="{ backgroundColor: getDotColor() }"
          @mouseover="$event.currentTarget.style.filter = 'brightness(0.9)'"
          @mouseout="$event.currentTarget.style.filter = 'brightness(1)'"
        >
          <span>New</span>
          <span>Points</span>
        </button>
      </div>

      <!-- Table -->
      <div
        class="hidden md:flex bg-ui-bg-dark font-bold text-ui-text text-xs shrink-0"
      >
        <div
          class="w-8 text-center text-[10px] flex items-center justify-center"
        >
          #
        </div>
        <div class="flex-1 flex">
          <div
            v-for="wIndex in numWeights"
            :key="wIndex"
            class="flex-1 text-center flex items-center justify-center"
            :class="numWeights > 6 && numWeights <= 20 ? 'text-[10px]' : 'text-sm'"
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
              <template v-else>x<sup>{{ wIndex - 1 }}</sup></template>
            </template>
          </div>
        </div>
        <div class="w-20 text-center flex items-center justify-center">
          Fitness
        </div>
      </div>

      <div class="flex-1 overflow-hidden hidden md:flex flex-col">
        <div
          v-for="(curve, index) in sortedCurves"
          :key="curve.id"
          class="flex flex-1 font-mono text-xs transition-colors"
          :class="
            index === 0 || solutionMethod === 'gradient'
              ? 'bg-ui-bg-highlight'
              : 'bg-ui-bg-dark hover:bg-ui-bg-hover'
          "
        >
          <div class="w-8 flex items-center justify-center text-ui-text-muted">
            {{ solutionMethod === 'gradient' ? '' : index + 1 }}
          </div>
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
            class="w-20 flex items-center justify-center font-bold text-ui-text text-[11px]"
          >
            {{ formatScientific(curve.fitness) }}
          </div>
        </div>
      </div>
    </div>

    <canvas
      ref="canvasRef"
      :width="CANVAS_SIZE * CANVAS_SCALE"
      :height="CANVAS_SIZE * CANVAS_SCALE"
      class="border-0 md:border-2 border-ui-border md:rounded-lg bg-canvas-bg touch-none order-1 md:order-2 w-full min-h-0 flex-1 max-w-full object-contain md:max-w-[66vw] md:h-full md:flex-initial"
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
      :upperBound="upperBound"
      :numPoints="numPoints"
      @close="closeInfoModal"
    />
  </div>
</template>
