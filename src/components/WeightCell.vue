<script setup lang="ts">
import { generateScientificNotation } from '../utils/formatters';

interface Props {
  weight: number;
  index: number;
  showFormula: boolean;
}

const props = defineProps<Props>();

// Format number with explicit sign
const formatWithSign = (value: number, decimals: number = 2): string => {
  const formatted: string = value.toFixed(decimals);
  return value >= 0 ? `+${formatted}` : formatted;
};

// Convert weight value to color (black=0, progressively red for positive, blue for negative)
const getWeightColor = (weight: number): string => {
  const absWeight: number = Math.abs(weight);
  const intensity: number = absWeight / (absWeight + 1);

  if (weight < 0) {
    // Negative - interpolate from black to blue (#3b82f6 = rgb(59, 130, 246))
    const r: number = Math.floor(0 + (59 - 0) * intensity);
    const g: number = Math.floor(0 + (130 - 0) * intensity);
    const b: number = Math.floor(0 + (246 - 0) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Positive - interpolate from black to red (#ef4444 = rgb(239, 68, 68))
    const r: number = Math.floor(0 + (239 - 0) * intensity);
    const g: number = Math.floor(0 + (68 - 0) * intensity);
    const b: number = Math.floor(0 + (68 - 0) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// Get text color (always white since background goes from black to colored)
const getTextColor = (weight: number): string => {
  // Always use white text since background starts at black and gets darker colors
  return '#ffffff';
};
</script>

<template>
  <div
    class="flex-1 flex items-center justify-center text-[9px] px-0.5"
    :style="{
      backgroundColor: getWeightColor(weight),
      color: getTextColor(weight),
    }"
    :title="`w${index}: ${formatWithSign(weight)}`"
  >
    <span v-if="showFormula" class="font-mono">{{
      generateScientificNotation(weight, 2)
    }}</span>
  </div>
</template>
