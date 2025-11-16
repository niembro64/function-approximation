<script setup lang="ts">
import { ref, watch } from 'vue';
import Slider from './Slider.vue';

interface Props {
  generationsPerSec: number;
  isRunning: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'reset': [];
  'toggle-play': [];
  'newPoints': [];
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
</script>

<template>
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

  <!-- Play/Pause, Reset, and New Points buttons -->
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
    <button
      @click="emit('newPoints')"
      class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
      style="background-color: #4a4a4a"
      @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
      @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
      @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
    >
      New Points
    </button>
  </div>
</template>
