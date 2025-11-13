<script setup lang="ts">
interface Props {
  weight: number;
  index: number;
  showFormula: boolean;
}

const props = defineProps<Props>();

// Format number in scientific notation with explicit signs
const formatScientific = (value: number, decimals: number = 2): string => {
  const expStr: string = value.toExponential(decimals);
  const withExpSign: string = expStr
    .replace(/e(\d)/, 'e+$1')
    .replace(/e\+\-/, 'e-');
  return value >= 0 ? `+${withExpSign}` : withExpSign;
};

// Format number with explicit sign
const formatWithSign = (value: number, decimals: number = 2): string => {
  const formatted: string = value.toFixed(decimals);
  return value >= 0 ? `+${formatted}` : formatted;
};

// Get power notation string
const getPowerNotation = (power: number): string => {
  if (power === 0) return '1';
  if (power === 1) return 'x';
  return `x^${power}`;
};

// Convert weight value to color (white=0, halfway at 1, full at infinity)
const getWeightColor = (weight: number): string => {
  const absWeight: number = Math.abs(weight);
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

// Get text color (black or white) based on background brightness
const getTextColor = (weight: number): string => {
  const absWeight: number = Math.abs(weight);
  const intensity: number = absWeight / (absWeight + 1);

  let r: number, g: number, b: number;

  if (weight < 0) {
    // Red background
    r = Math.floor(255 + (251 - 255) * intensity);
    g = Math.floor(255 + (44 - 255) * intensity);
    b = Math.floor(255 + (54 - 255) * intensity);
  } else {
    // Blue background
    r = Math.floor(255 + (43 - 255) * intensity);
    g = Math.floor(255 + (127 - 255) * intensity);
    b = Math.floor(255 + (255 - 255) * intensity);
  }

  // Calculate relative luminance using sRGB formula
  const luminance: number = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use black text for light backgrounds, white text for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
</script>

<template>
  <div
    class="flex-1 flex flex-col items-center justify-center text-[8px] px-0.5 leading-tight"
    :style="{
      backgroundColor: getWeightColor(weight),
      color: getTextColor(weight)
    }"
    :title="`w${index}: ${formatWithSign(weight)}`"
  >
    <template v-if="showFormula">
      <span class="font-mono">{{ formatScientific(weight) }}</span>
      <span class="font-mono text-[7px]">{{ getPowerNotation(index) }}</span>
    </template>
  </div>
</template>
