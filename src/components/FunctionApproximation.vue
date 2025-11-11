<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import Slider from './Slider.vue';

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
const TAILWIND_GREEN_500: string = '#00c950';

// Slider Ranges
const MIN_POINTS: number = 1;
const MAX_POINTS: number = 16;
const DEFAULT_NUM_POINTS: number = 6;

const MIN_WEIGHTS: number = 1;
const MAX_WEIGHTS: number = 24;
const DEFAULT_NUM_WEIGHTS: number = 16;

const MIN_CHILDREN: number = 2;
const MAX_CHILDREN: number = 64;
const DEFAULT_NUM_CHILDREN: number = 16;

const MIN_GENERATIONS_PER_SEC: number = 1;
const MAX_GENERATIONS_PER_SEC: number = 256;
const DEFAULT_GENERATIONS_PER_SEC: number = 60;

// Point and Curve Generation
const POINT_RADIUS: number = 8; // Size of data points on canvas

// Dot/Point Colors (for canvas points and slider thumbs)
const DOT_COLOR: string = TAILWIND_GREEN_500;
const DOT_BORDER_COLOR: string = '#ffffff';
const DOT_BORDER_WIDTH: number = 3;

// Curve Drawing Styles
const BEST_CURVE_LINE_WIDTH: number = 5;
const BEST_CURVE_COLOR: string = TAILWIND_GREEN_500;
const OTHER_CURVE_LINE_WIDTH: number = 2;
const OTHER_CURVE_COLOR: string = '#666666'; // Gray
const OTHER_CURVE_OPACITY: number = 0.5;

// Genetic Algorithm / Mutation
type MutationDistribution = 'normal' | 'uniform';
const MUTATION_DISTRIBUTION_TYPE: MutationDistribution = 'normal'; // Distribution type: 'normal' (Gaussian) or 'uniform'
const MUTATION_MIN_VARIANCE: number = 0.0; // Minimum variance (for index 0)
const MUTATION_MAX_VARIANCE: number = 0.2; // Maximum variance (for last index)
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

// Canvas Dimensions
const CANVAS_SIZE = ref<number>(500);
const PADDING: number = 40;
const MIN_CANVAS_SIZE: number = 350;
const VIEWPORT_HEIGHT_OFFSET: number = 60;
const VIEWPORT_WIDTH_OFFSET: number = 660; // Increased for wider left panel

// Curve Drawing
const CURVE_RESOLUTION: number = 200; // Number of points to draw curves

// Error Bars
const ERROR_BAR_LINE_WIDTH: number = 3;

// Grid and Axes
const GRID_LINE_WIDTH: number = 1;
const AXIS_LINE_WIDTH: number = 2;

// Canvas Colors
const COLOR_ERROR_BARS: string = TAILWIND_RED_500;
const COLOR_POINTS: string = DOT_COLOR;
const COLOR_POINT_BORDER: string = DOT_BORDER_COLOR;
const COLOR_BACKGROUND: string = '#1a1a1a'; // Dark gray
const COLOR_GRID: string = '#333'; // Dark gray
const COLOR_AXES: string = '#666'; // Gray
const COLOR_LABELS: string = '#aaa'; // Light gray

// Reactive state
const canvasRef = ref<HTMLCanvasElement | null>(null);
const allPoints = ref<Point[]>([]); // Full set of points (up to MAX_POINTS)
const curves = ref<Curve[]>([]);
const numPoints = ref<number>(DEFAULT_NUM_POINTS);
const numWeights = ref<number>(DEFAULT_NUM_WEIGHTS);
const numChildren = ref<number>(DEFAULT_NUM_CHILDREN);
const generationsPerSec = ref<number>(DEFAULT_GENERATIONS_PER_SEC);
let animationFrameId: number | null = null;
let lastFrameTime: number = 0;
let generationAccumulator: number = 0;

// Drag state
const draggingPointIndex = ref<number | null>(null);
const hoveredPointIndex = ref<number | null>(null);

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
  const rawScale: number = Math.sqrt(fitness / ADAPTIVE_VARIANCE_FITNESS_TARGET);

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
  return WEIGHT_PROPORTIONAL_VARIANCE_MIN + (absWeight * WEIGHT_PROPORTIONAL_VARIANCE_FACTOR);
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
        varianceFactor * (MUTATION_MAX_VARIANCE - MUTATION_MIN_VARIANCE);

      // Apply adaptive scaling to base variance
      const adaptiveVariance: number = baseVariance * adaptiveScale;

      // Apply mutations to each weight
      const mutatedWeights: number[] = bestCurve.weights.map(
        (weight: number, weightIndex: number): number => {
          // Get variance scale for this weight (default to 1.0 if not specified)
          const varianceScale: number =
            MUTATION_WEIGHT_VARIANCE_SCALES[weightIndex] ?? 1.0;

          // Get weight-proportional scale based on magnitude
          const weightProportionalScale: number = getWeightProportionalScale(weight);

          // Combine all scaling factors
          const weightVariance: number = adaptiveVariance * varianceScale * weightProportionalScale;

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

  // Accumulate generations to run based on desired rate
  generationAccumulator += deltaTime * generationsPerSec.value;

  // Run as many generations as accumulated (can be 0, 1, or multiple)
  while (generationAccumulator >= 1) {
    generateCurvesFromBest();
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

// Calculate fitness (Mean Squared Error - lower is better)
const calculateFitness = (curve: Curve): number => {
  let sumSquaredError: number = 0;
  points.value.forEach((point: Point): void => {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;
    sumSquaredError += error * error;
  });
  return sumSquaredError / points.value.length;
};

// Update fitness for all curves
const updateFitness = (): void => {
  curves.value.forEach((curve: Curve): void => {
    curve.fitness = calculateFitness(curve);
  });
};

// Get sorted curves by fitness (best first)
const sortedCurves = computed((): Curve[] => {
  return [...curves.value].sort(
    (a: Curve, b: Curve): number => a.fitness - b.fitness
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

// Format number in scientific notation with explicit signs on both mantissa and exponent
const formatScientific = (value: number, decimals: number = 4): string => {
  const expStr: string = value.toExponential(decimals);
  // Replace 'e' or 'e-' with 'e+' or 'e-' to always show sign on exponent
  const withExpSign: string = expStr
    .replace(/e(\d)/, 'e+$1')
    .replace(/e\+\-/, 'e-');
  // Add sign to mantissa if positive
  return value >= 0 ? `+${withExpSign}` : withExpSign;
};

// Convert weight value to color (white=0, halfway at 1, full at infinity)
const getWeightColor = (weight: number): string => {
  const absWeight: number = Math.abs(weight);

  // Map weight to intensity: 0->0%, 1->50%, infinity->100%
  // Using formula: intensity = absWeight / (absWeight + 1)
  // This gives: 0->0, 1->0.5, 2->0.67, 3->0.75, infinity->1
  const intensity: number = absWeight / (absWeight + 1);

  if (weight < 0) {
    // Negative - interpolate from white to TAILWIND_RED_500 (#fb2c36 = rgb(251, 44, 54))
    const r: number = Math.floor(255 + (251 - 255) * intensity);
    const g: number = Math.floor(255 + (44 - 255) * intensity);
    const b: number = Math.floor(255 + (54 - 255) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Positive - interpolate from white to TAILWIND_BLUE_500 (#2b7fff = rgb(43, 127, 255))
    const r: number = Math.floor(255 + (43 - 255) * intensity);
    const g: number = Math.floor(255 + (127 - 255) * intensity);
    const b: number = Math.floor(255 + (255 - 255) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  }
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
  const availableHeight: number = viewportHeight - VIEWPORT_HEIGHT_OFFSET;
  const availableWidth: number = viewportWidth - VIEWPORT_WIDTH_OFFSET;
  const size: number = Math.min(availableHeight, availableWidth);
  CANVAS_SIZE.value = Math.max(MIN_CANVAS_SIZE, Math.floor(size));
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
  return index === 0 ? BEST_CURVE_COLOR : OTHER_CURVE_COLOR;
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

// Draw everything on canvas
const draw = (): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (canvas === null) return;

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (ctx === null) return;

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

      const range: number = COORD_MAX - COORD_MIN;
      for (let i: number = 0; i <= CURVE_RESOLUTION; i++) {
        const x: number = COORD_MIN + (i / CURVE_RESOLUTION) * range;
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
      const pointCoords: CanvasCoords = toCanvasCoords(
        point.x,
        point.y
      );
      const predictedY: number = evaluateCurve(bestCurve, point.x);
      const curveCoords: CanvasCoords = toCanvasCoords(
        point.x,
        predictedY
      );

      ctx.beginPath();
      ctx.moveTo(pointCoords.cx, pointCoords.cy);
      ctx.lineTo(curveCoords.cx, curveCoords.cy);
      ctx.stroke();
    });
  }

  // Draw points
  points.value.forEach((point: Point): void => {
    const coords: CanvasCoords = toCanvasCoords(point.x, point.y);

    ctx.fillStyle = COLOR_POINTS;
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
  generateCurves();
  draw();
  window.addEventListener('resize', handleResize);
  startEvolution(); // Auto-start evolution
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
    generateCurves();
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
  <div class="flex gap-4 justify-center items-stretch flex-1 overflow-hidden">
    <div
      class="w-[600px] flex flex-col text-left p-3 bg-ui-bg rounded-lg border-2 border-ui-border overflow-hidden"
    >
      <!-- Buttons -->
      <div class="mb-3 flex gap-2">
        <button
          @click="generateCurves"
          class="flex-1 p-2 bg-primary text-white border-none rounded cursor-pointer transition-all hover:bg-primary-hover active:translate-y-px"
        >
          Random Curves
        </button>
        <button
          @click="generateRandomPoints"
          class="flex-1 p-2 bg-primary text-white border-none rounded cursor-pointer transition-all hover:bg-primary-hover active:translate-y-px"
        >
          Random Points
        </button>
      </div>

      <!-- Sliders -->
      <div class="mb-3 flex flex-col gap-2">
        <Slider
          label="Points"
          v-model="numPoints"
          :min="MIN_POINTS"
          :max="MAX_POINTS"
        />
        <Slider
          label="Weights (i)"
          v-model="numWeights"
          :min="MIN_WEIGHTS"
          :max="MAX_WEIGHTS"
        />
        <Slider
          label="Children"
          v-model="numChildren"
          :min="MIN_CHILDREN"
          :max="MAX_CHILDREN"
        />
        <Slider
          label="Speed"
          v-model="generationsPerSec"
          :min="MIN_GENERATIONS_PER_SEC"
          :max="MAX_GENERATIONS_PER_SEC"
        />
      </div>

      <div class="m-0 mb-2 text-white text-2xl flex items-center justify-center gap-3 font-mono">
        <span>f(x) =</span>
        <div class="inline-flex flex-col items-center leading-none">
          <span class="text-sm">{{ upperBound }}</span>
          <span class="text-5xl leading-none">Σ</span>
          <span class="text-sm">i=0</span>
        </div>
        <span>wᵢxⁱ</span>
      </div>


      <div class="flex bg-ui-bg-dark font-bold text-ui-text text-xs shrink-0">
        <div
          class="w-12 text-center text-[10px] flex items-center justify-center"
        >
          #
        </div>
        <div class="flex-1 flex">
          <div
            v-for="wIndex in numWeights"
            :key="wIndex"
            class="flex-1 text-center text-[10px] flex items-center justify-center"
          >
            {{ wIndex - 1 }}
          </div>
        </div>
        <div class="w-24 text-center flex items-center justify-center">
          Fitness
        </div>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col">
        <div
          v-for="(curve, index) in sortedCurves"
          :key="curve.id"
          class="flex flex-1 font-mono text-xs transition-colors"
          :class="
            index === 0
              ? 'bg-ui-bg-highlight'
              : 'bg-ui-bg-dark hover:bg-ui-bg-hover'
          "
        >
          <div class="w-12 flex items-center justify-center text-ui-text-muted">
            {{ index + 1 }}
          </div>
          <div class="flex-1 flex">
            <div
              v-for="(weight, wIndex) in curve.weights"
              :key="wIndex"
              class="flex-1"
              :style="{ backgroundColor: getWeightColor(weight) }"
              :title="`w${wIndex}: ${formatWithSign(weight)}`"
            />
          </div>
          <div
            class="w-24 flex items-center justify-center font-bold text-ui-text text-[11px]"
          >
            {{ formatScientific(curve.fitness) }}
          </div>
        </div>
      </div>
    </div>

    <canvas
      ref="canvasRef"
      :width="CANVAS_SIZE"
      :height="CANVAS_SIZE"
      class="border-2 border-ui-border rounded-lg bg-canvas-bg shrink-0"
      :style="{ cursor: hoveredPointIndex !== null || draggingPointIndex !== null ? 'pointer' : 'default' }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    />
  </div>
</template>
