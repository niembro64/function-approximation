<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { SolutionMethod } from '../types';
import { CONFIG } from '../config';

interface Props {
  lossHistory: Map<SolutionMethod, number[]>;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const CANVAS_SIZE = 800;
const CANVAS_WIDTH = CANVAS_SIZE;
const CANVAS_HEIGHT = CANVAS_SIZE;
const PADDING = 60;

// Draw the loss comparison graph
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

  // Find max generation across all algorithms
  let maxGen = 0;
  props.lossHistory.forEach((losses) => {
    maxGen = Math.max(maxGen, losses.length);
  });

  if (maxGen === 0) return;

  // Find min and max loss values for log scale
  let minLoss = Infinity;
  let maxLoss = -Infinity;
  props.lossHistory.forEach((losses) => {
    losses.forEach((loss) => {
      if (loss > 0) {
        minLoss = Math.min(minLoss, loss);
        maxLoss = Math.max(maxLoss, loss);
      }
    });
  });

  if (!isFinite(minLoss) || !isFinite(maxLoss)) return;

  // Use log10 scale for y-axis
  const logMin = Math.log10(minLoss);
  const logMax = Math.log10(maxLoss);
  const logRange = logMax - logMin;

  // Draw axes
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Y-axis
  ctx.moveTo(PADDING, PADDING);
  ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
  // X-axis
  ctx.lineTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
  ctx.stroke();

  // Draw grid lines and labels
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#aaa';
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';

  // Y-axis grid (log10 scale)
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const logValue = logMin + (i / numYTicks) * logRange;
    const value = Math.pow(10, logValue);
    const y = CANVAS_HEIGHT - PADDING - (i / numYTicks) * graphHeight;

    ctx.beginPath();
    ctx.moveTo(PADDING, y);
    ctx.lineTo(CANVAS_WIDTH - PADDING, y);
    ctx.stroke();

    ctx.fillText(value.toExponential(1), PADDING - 5, y + 4);
  }

  // X-axis grid
  ctx.textAlign = 'center';
  const numXTicks = 5;
  for (let i = 0; i <= numXTicks; i++) {
    const gen = Math.floor((i / numXTicks) * maxGen);
    const x = PADDING + (i / numXTicks) * graphWidth;

    ctx.beginPath();
    ctx.moveTo(x, PADDING);
    ctx.lineTo(x, CANVAS_HEIGHT - PADDING);
    ctx.stroke();

    ctx.fillText(gen.toString(), x, CANVAS_HEIGHT - PADDING + 20);
  }

  // Axis labels
  ctx.fillStyle = '#aaa';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Generation', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

  ctx.save();
  ctx.translate(15, CANVAS_HEIGHT / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Loss (log scale)', 0, 0);
  ctx.restore();

  // Draw lines for each algorithm - sorted worst to best (so best is on top)
  // Get algorithms with their current losses and sort
  const algorithmsWithLoss: Array<{ algorithm: SolutionMethod; loss: number }> = [];
  CONFIG.algorithmOrder.forEach((algorithm: SolutionMethod) => {
    // Skip polynomial solver
    if (algorithm === 'polynomial-solver') return;

    const losses = props.lossHistory.get(algorithm);
    const currentLoss = losses && losses.length > 0 ? losses[losses.length - 1] : Infinity;
    algorithmsWithLoss.push({ algorithm, loss: currentLoss });
  });

  // Sort by loss descending (worst first, best last)
  algorithmsWithLoss.sort((a, b) => b.loss - a.loss);

  // Draw in sorted order
  algorithmsWithLoss.forEach(({ algorithm }) => {
    const losses = props.lossHistory.get(algorithm);
    if (!losses) return;

    const color = CONFIG.utils.getAlgoColor(algorithm);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    losses.forEach((loss, gen) => {
      if (loss > 0) {
        const logLoss = Math.log10(loss);
        const x = PADDING + (gen / maxGen) * graphWidth;
        const y = CANVAS_HEIGHT - PADDING - ((logLoss - logMin) / logRange) * graphHeight;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });

    ctx.stroke();
  });

  // Draw legend - sorted by current loss (best at top)
  ctx.textAlign = 'left';
  ctx.font = '12px monospace';
  let legendY = PADDING;
  const legendX = CANVAS_WIDTH - PADDING - 220;

  // Draw sorted legend (reverse order so best is at top)
  [...algorithmsWithLoss].reverse().forEach(({ algorithm, loss }) => {
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
const maxGen = computed(() => {
  let max = 0;
  props.lossHistory.forEach((losses) => {
    max = Math.max(max, losses.length);
  });
  return max;
});

// Redraw when loss history changes
watch(() => props.lossHistory, () => {
  draw();
}, { deep: true });

watch(maxGen, () => {
  draw();
});
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="CANVAS_WIDTH"
    :height="CANVAS_HEIGHT"
    class="max-w-full max-h-full object-contain"
    style="width: auto; height: auto;"
  />
</template>
