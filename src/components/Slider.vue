<script setup lang="ts">
interface Props {
  label: string;
  modelValue: number;
  min: number;
  max: number;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>

<template>
  <div class="flex items-center gap-3">
    <label class="text-ui-text-normal text-sm w-32 font-mono">{{ label }}</label>
    <div class="flex-1 relative">
      <input
        type="range"
        :value="modelValue"
        @input="handleInput"
        :min="min"
        :max="max"
        class="custom-slider w-full"
      />
    </div>
    <span class="text-ui-text text-sm font-mono w-10 text-right">{{ modelValue }}</span>
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
