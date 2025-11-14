<script setup lang="ts">
import { computed } from 'vue';
import { generateScientificNotation } from '../utils/formatters';

interface Props {
  label: string;
  modelValue: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  logarithmic?: boolean;
  logMidpoint?: number; // The actual value at the slider's midpoint
  useScientificNotation?: boolean;
  thumbColor?: string; // Custom thumb color
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

// Convert actual value to slider position (0-100)
const sliderValue = computed((): number => {
  if (!props.logarithmic) {
    return props.modelValue;
  }

  // Logarithmic mapping
  const minVal = props.min;
  const maxVal = props.max;
  const midVal = props.logMidpoint ?? 0.01;

  if (props.modelValue <= minVal) return 0;
  if (props.modelValue >= maxVal) return 100;

  // Use two-segment logarithmic mapping
  if (props.modelValue <= midVal) {
    // First half: 0 to midpoint (0 to 50)
    if (minVal === 0) {
      // Special handling when min is 0
      return (props.modelValue / midVal) * 50;
    } else {
      const logMin = Math.log(minVal);
      const logMid = Math.log(midVal);
      const logVal = Math.log(props.modelValue);
      return ((logVal - logMin) / (logMid - logMin)) * 50;
    }
  } else {
    // Second half: midpoint to max (50 to 100)
    const logMid = Math.log(midVal);
    const logMax = Math.log(maxVal);
    const logVal = Math.log(props.modelValue);
    return 50 + ((logVal - logMid) / (logMax - logMid)) * 50;
  }
});

// Convert slider position back to actual value
const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const sliderPos = Number(target.value);

  if (!props.logarithmic) {
    emit('update:modelValue', sliderPos);
    return;
  }

  // Inverse logarithmic mapping
  const minVal = props.min;
  const maxVal = props.max;
  const midVal = props.logMidpoint ?? 0.01;

  let actualValue: number;

  if (sliderPos <= 50) {
    // First half: 0 to midpoint
    if (minVal === 0) {
      // Linear mapping from 0 to midpoint
      actualValue = (sliderPos / 50) * midVal;
    } else {
      const logMin = Math.log(minVal);
      const logMid = Math.log(midVal);
      const logVal = logMin + (sliderPos / 50) * (logMid - logMin);
      actualValue = Math.exp(logVal);
    }
  } else {
    // Second half: midpoint to max
    const logMid = Math.log(midVal);
    const logMax = Math.log(maxVal);
    const logVal = logMid + ((sliderPos - 50) / 50) * (logMax - logMid);
    actualValue = Math.exp(logVal);
  }

  emit('update:modelValue', actualValue);
};

const displayValue = (): string => {
  if (props.useScientificNotation) {
    return generateScientificNotation(props.modelValue, props.decimals ?? 2);
  }
  if (props.decimals !== undefined) {
    return props.modelValue.toFixed(props.decimals);
  }
  return props.modelValue.toString();
};
</script>

<template>
  <div class="flex items-center gap-2 md:gap-3">
    <label class="text-ui-text-normal text-xs md:text-sm w-32 md:w-40 font-mono shrink-0">{{ label }}</label>
    <div class="flex-1">
      <input
        type="range"
        :value="logarithmic ? sliderValue : modelValue"
        @input="handleInput"
        :min="logarithmic ? 0 : min"
        :max="logarithmic ? 100 : max"
        :step="logarithmic ? 0.1 : (step || 1)"
        class="custom-slider w-full"
      />
    </div>
    <span class="text-ui-text text-xs md:text-sm font-mono w-16 md:w-20 text-right shrink-0">{{ displayValue() }}</span>
  </div>
</template>

<style scoped>
.custom-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  background: #555555;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.custom-slider:hover {
  background: #666666;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  background: v-bind('thumbColor || "#00c950"');
  border: 3px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.custom-slider::-webkit-slider-thumb:hover {
  filter: brightness(0.9);
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.custom-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: v-bind('thumbColor || "#00c950"');
  border: 3px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.custom-slider::-moz-range-thumb:hover {
  filter: brightness(0.9);
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.custom-slider::-moz-range-track {
  height: 10px;
  background: transparent;
  border: none;
}
</style>
