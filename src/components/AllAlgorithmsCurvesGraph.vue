<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import type { SolutionMethod, Point, Curve } from '../types';
import { CONFIG } from '../config';

interface AlgorithmState {
  curves: Curve[];
  psParticles?: any[];
  psGlobalBestWeights?: number[];
  psGlobalBestLoss?: number;
  saCurrentBest?: number[];
  saBestLoss?: number;
  saTemp?: number;
  momentumV?: number[];
  adamM?: number[];
  adamV?: number[];
  adamT?: number;
}

interface Props {
  allAlgoStates: Map<SolutionMethod, AlgorithmState>;
  points: Point[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDING = 25;

// Evaluate polynomial curve
const evaluateCurve = (curve: Curve, x: number): number => {
  return curve.weights.reduce(
    (sum: number, weight: number, index: number): number => {
      return sum + weight * Math.pow(x, index);
    },
    0
  );
};

// Calculate base loss (Mean Squared Error)
const calculateBaseLoss = (curve: Curve, points: Point[]): number => {
  let sumSquaredError: number = 0;
  points.forEach((point: Point): void => {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;
    sumSquaredError += error * error;
  });
  return sumSquaredError / points.length;
};

// Get best curve from an algorithm's state
const getBestCurve = (state: AlgorithmState): Curve | null => {
  if (!state.curves || state.curves.length === 0) return null;

  // Find the curve with the lowest loss
  let bestCurve = state.curves[0];
  let bestLoss = calculateBaseLoss(bestCurve, props.points);

  for (let i = 1; i < state.curves.length; i++) {
    const curve = state.curves[i];
    const loss = calculateBaseLoss(curve, props.points);
    if (loss < bestLoss) {
      bestCurve = curve;
      bestLoss = loss;
    }
  }

  return bestCurve;
};

// Convert coordinates from coordinate system range to canvas coordinates
const toCanvasCoords = (x: number, y: number): { cx: number; cy: number } => {
  const size = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) - 2 * PADDING;
  const range = CONFIG.coordinates.max - CONFIG.coordinates.min;
  return {
    cx: PADDING + ((x - CONFIG.coordinates.min) * size) / range,
    cy: CANVAS_HEIGHT - PADDING - ((y - CONFIG.coordinates.min) * size) / range,
  };
};

// Draw the graph
const draw = (): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const graphWidth = CANVAS_WIDTH - 2 * PADDING;
  const graphHeight = CANVAS_HEIGHT - 2 * PADDING;

  // Draw grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const pos = PADDING + (i / 10) * Math.min(graphWidth, graphHeight);

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(pos, PADDING);
    ctx.lineTo(pos, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(PADDING, pos);
    ctx.lineTo(CANVAS_WIDTH - PADDING, pos);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;

  // X-axis
  ctx.beginPath();
  const originCoords = toCanvasCoords(0, 0);
  ctx.moveTo(PADDING, originCoords.cy);
  ctx.lineTo(CANVAS_WIDTH - PADDING, originCoords.cy);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(originCoords.cx, PADDING);
  ctx.lineTo(originCoords.cx, CANVAS_HEIGHT - PADDING);
  ctx.stroke();

  // Draw all algorithm curves
  CONFIG.algorithmOrder.forEach((algorithm: SolutionMethod) => {
    // Skip polynomial solver
    if (algorithm === 'polynomial-solver') return;

    const state = props.allAlgoStates.get(algorithm);
    if (!state) return;

    const bestCurve = getBestCurve(state);
    if (!bestCurve) return;

    const color = CONFIG.utils.getAlgoColor(algorithm);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();

    // Extend drawing range horizontally beyond visible area
    const drawMin = CONFIG.coordinates.min - CONFIG.coordinates.curveHorizontalOverdraw;
    const drawMax = CONFIG.coordinates.max + CONFIG.coordinates.curveHorizontalOverdraw;
    const range = drawMax - drawMin;
    const resolution = 200;

    for (let i = 0; i <= resolution; i++) {
      const x = drawMin + (i / resolution) * range;
      const y = evaluateCurve(bestCurve, x);
      const coords = toCanvasCoords(x, y);

      if (i === 0) {
        ctx.moveTo(coords.cx, coords.cy);
      } else {
        ctx.lineTo(coords.cx, coords.cy);
      }
    }
    ctx.stroke();
  });

  ctx.globalAlpha = 1.0;

  // Draw points
  props.points.forEach((point: Point): void => {
    const coords = toCanvasCoords(point.x, point.y);

    ctx.fillStyle = CONFIG.colors.points.darkGray;
    ctx.beginPath();
    ctx.arc(coords.cx, coords.cy, CONFIG.drawing.pointRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = CONFIG.colors.canvas.pointBorder;
    ctx.lineWidth = CONFIG.drawing.dot.borderWidth;
    ctx.stroke();
  });

  // Draw labels
  ctx.fillStyle = '#aaa';
  ctx.font = '12px monospace';
  const center = PADDING + Math.min(graphWidth, graphHeight) / 2;

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.fillText(CONFIG.coordinates.min.toString(), PADDING, CANVAS_HEIGHT - PADDING + 15);
  ctx.fillText('0', center, CANVAS_HEIGHT - PADDING + 15);
  ctx.fillText(CONFIG.coordinates.max.toString(), PADDING + Math.min(graphWidth, graphHeight), CANVAS_HEIGHT - PADDING + 15);

  // Y-axis labels
  ctx.textAlign = 'right';
  ctx.fillText(CONFIG.coordinates.min.toString(), PADDING - 5, CANVAS_HEIGHT - PADDING + 5);
  ctx.fillText('0', PADDING - 5, center + 5);
  ctx.fillText(CONFIG.coordinates.max.toString(), PADDING - 5, PADDING + 5);

  // Draw legend - sorted by current loss (best at top)
  ctx.textAlign = 'left';
  ctx.font = '12px monospace';
  let legendY = PADDING;
  const legendX = CANVAS_WIDTH - PADDING - 220;

  // Get algorithms with their current losses and sort
  const algorithmsWithLoss: Array<{ algorithm: SolutionMethod; loss: number }> = [];
  CONFIG.algorithmOrder.forEach((algorithm) => {
    // Skip polynomial solver
    if (algorithm === 'polynomial-solver') return;

    const state = props.allAlgoStates.get(algorithm);
    if (!state) return;

    const bestCurve = getBestCurve(state);
    const currentLoss = bestCurve ? calculateBaseLoss(bestCurve, props.points) : Infinity;
    algorithmsWithLoss.push({ algorithm, loss: currentLoss });
  });

  // Sort by loss (ascending - best at top)
  algorithmsWithLoss.sort((a, b) => a.loss - b.loss);

  // Draw sorted legend
  algorithmsWithLoss.forEach(({ algorithm, loss }) => {
    const color = CONFIG.utils.getAlgoColor(algorithm);
    const info = CONFIG.utils.getAlgoInfo(algorithm);

    // Format loss in exponential notation with 4 decimal places
    const lossText = loss === Infinity ? 'N/A' : loss.toExponential(4);

    ctx.fillStyle = '#aaa';
    ctx.fillText(lossText, legendX, legendY + 4);

    ctx.fillStyle = color;
    ctx.fillRect(legendX + 85, legendY - 8, 15, 15);

    ctx.fillStyle = '#aaa';
    ctx.fillText(info.name, legendX + 105, legendY + 4);

    legendY += 20;
  });
};

onMounted(() => {
  draw();
});

// Watch for changes that require redraw
watch(() => props.allAlgoStates, () => {
  draw();
}, { deep: true });

watch(() => props.points, () => {
  draw();
}, { deep: true });
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="CANVAS_WIDTH"
    :height="CANVAS_HEIGHT"
    class="border-0 md:border-2 border-ui-border md:rounded-lg bg-canvas-bg order-1 md:order-2 w-full min-h-0 flex-1 max-w-full object-contain object-top md:max-w-[66vw] md:h-full md:flex-initial"
  />
</template>
