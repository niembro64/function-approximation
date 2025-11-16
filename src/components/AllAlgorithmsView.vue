<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import Slider from './Slider.vue';
import type { SolutionMethod } from '../types';
import { CONFIG } from '../config';

interface Props {
  lossHistory: Map<SolutionMethod, number[]>;
  generationsPerSec: number;
  isRunning: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'reset': [];
  'toggle-play': [];
  'update:generationsPerSec': [value: number];
}>();

const genPerSecValue = ref(props.generationsPerSec);

// Watch for external changes to props
watch(() => props.generationsPerSec, (newVal) => {
  genPerSecValue.value = newVal;
});

// Watch for internal changes and emit
watch(genPerSecValue, (newVal) => {
  emit('update:generationsPerSec', newVal);
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
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

  // Draw lines for each algorithm
  props.lossHistory.forEach((losses, algorithm) => {
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

  // Draw legend
  ctx.textAlign = 'left';
  ctx.font = '12px monospace';
  let legendY = PADDING;
  const legendX = CANVAS_WIDTH - PADDING - 150;

  CONFIG.algorithmOrder.forEach((algorithm) => {
    // Skip polynomial solver
    if (algorithm === 'polynomial-solver') return;

    const color = CONFIG.utils.getAlgoColor(algorithm);
    const info = CONFIG.utils.getAlgoInfo(algorithm);

    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 8, 15, 15);

    ctx.fillStyle = '#aaa';
    ctx.fillText(info.name, legendX + 20, legendY + 4);

    legendY += 20;
  });
};

// Redraw on props change
const redraw = (): void => {
  requestAnimationFrame(draw);
};

onMounted(() => {
  draw();
});

onUnmounted(() => {
  // Cleanup if needed
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
  <div class="flex flex-col gap-2 md:gap-3">
    <!-- Gen Per Sec Slider -->
    <div class="mb-2 md:mb-3 flex flex-col gap-1.5 md:gap-2">
      <Slider
        label="Gen Per Sec"
        v-model="genPerSecValue"
        :min="1"
        :max="60"
        :step="1"
        :decimals="0"
        thumbColor="#666666"
      />
    </div>

    <!-- Play/Pause and Reset buttons -->
    <div class="flex items-stretch gap-2 mb-2 md:mb-3">
      <button
        @click="emit('toggle-play')"
        class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
        :style="{ backgroundColor: isRunning ? '#dc2626' : '#16a34a' }"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      >
        {{ isRunning ? 'Pause' : 'Play' }}
      </button>
      <button
        @click="emit('reset')"
        class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
        style="background-color: #666666"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      >
        Reset Algos
      </button>
    </div>

    <!-- Canvas for graph -->
    <div class="flex justify-center">
      <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        class="border-0 md:border-2 border-ui-border md:rounded-lg bg-canvas-bg"
      />
    </div>
  </div>
</template>
