<script setup lang="ts">
interface Props {
  label: string;
  modelValue: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};

const displayValue = (): string => {
  if (props.decimals !== undefined) {
    return props.modelValue.toFixed(props.decimals);
  }
  return props.modelValue.toString();
};
</script>

<template>
  <div class="flex items-center gap-2 md:gap-3">
    <label class="text-ui-text-normal text-xs md:text-sm w-40 md:w-64 font-mono">{{ label }}</label>
    <div class="flex-1 relative max-w-[150px] md:max-w-[180px]">
      <input
        type="range"
        :value="modelValue"
        @input="handleInput"
        :min="min"
        :max="max"
        :step="step || 1"
        class="custom-slider w-full"
      />
    </div>
    <span class="text-ui-text text-xs md:text-sm font-mono w-12 md:w-16 text-right">{{ displayValue() }}</span>
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
  background: #00c950; /* TAILWIND_GREEN_500 / DOT_COLOR */
  border: 3px solid #ffffff; /* DOT_BORDER_COLOR with DOT_BORDER_WIDTH */
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.custom-slider::-webkit-slider-thumb:hover {
  background: #00b347; /* Darker green for hover */
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.custom-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: #00c950; /* TAILWIND_GREEN_500 / DOT_COLOR */
  border: 3px solid #ffffff; /* DOT_BORDER_COLOR with DOT_BORDER_WIDTH */
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.custom-slider::-moz-range-thumb:hover {
  background: #00b347; /* Darker green for hover */
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.custom-slider::-moz-range-track {
  height: 10px;
  background: transparent;
  border: none;
}
</style>
