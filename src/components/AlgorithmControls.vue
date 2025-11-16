<script setup lang="ts">
import type { AlgorithmInfo } from '../types';

interface Props {
  currentAlgoInfo: AlgorithmInfo;
  currentAlgoColor: string;
  pointsColor: string;
  mode: 'single' | 'all';
}

defineProps<Props>();

const emit = defineEmits<{
  'info': [];
  'previous': [];
  'next': [];
  'selectAlgorithm': [];
  'reset': [];
  'resetParams': [];
  'newPoints': [];
  'toggleMode': [];
}>();
</script>

<template>
  <!-- All Buttons -->
  <div class="mb-2 md:mb-3 flex flex-col gap-2">
    <!-- Mode Toggle Button -->
    <button
      @click="emit('toggleMode')"
      class="py-3 md:py-2 px-4 text-sm md:text-base font-bold text-white bg-gray-700 border-none rounded cursor-pointer transition-all order-3"
      style="filter: brightness(1)"
      @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
      @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
      @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
    >
      {{ mode === 'single' ? 'Single Algorithm' : 'All Algorithms' }}
    </button>

    <!-- First Row: Info + Back + Algorithm Name + Next + Select -->
    <div class="flex items-center gap-2 order-2" v-if="mode === 'single'">
      <!-- Info Button -->
      <button
        @click="emit('info')"
        class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
        style="filter: brightness(1)"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        aria-label="Information"
        title="Learn more about this project"
      >
        <span class="text-lg md:text-base font-bold">i</span>
      </button>

      <!-- Previous Algorithm Button (Back) -->
      <button
        @click="emit('previous')"
        class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
        style="filter: brightness(1)"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        aria-label="Previous Algorithm"
        title="Previous algorithm"
      >
        <span class="text-lg md:text-base font-bold"><</span>
      </button>

      <!-- Algorithm Name (Not clickable) -->
      <div
        class="flex-1 py-2 md:py-1 px-3 text-white text-center flex flex-col items-center justify-center"
      >
        <div class="text-xs md:text-xs opacity-80">{{ currentAlgoInfo.category }}</div>
        <div class="text-sm md:text-base font-bold">{{ currentAlgoInfo.name }}</div>
      </div>

      <!-- Next Algorithm Button -->
      <button
        @click="emit('next')"
        class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
        style="filter: brightness(1)"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        aria-label="Next Algorithm"
        title="Next algorithm"
      >
        <span class="text-lg md:text-base font-bold">></span>
      </button>

      <!-- Select Algorithm Button (Menu) -->
      <button
        @click="emit('selectAlgorithm')"
        class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-gray-600 text-white border-none rounded-full cursor-pointer transition-all shrink-0"
        style="filter: brightness(1)"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        aria-label="Select Algorithm"
        title="Select algorithm"
      >
        <span class="text-lg md:text-base font-bold">^</span>
      </button>
    </div>

    <!-- Second Row: Reset/New Buttons -->
    <div class="flex items-stretch gap-2 order-1" v-if="mode === 'single'">
      <button
        @click="emit('reset')"
        class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
        :style="{ backgroundColor: currentAlgoColor }"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      >
        Reset Algo
      </button>
      <button
        @click="emit('resetParams')"
        class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
        :style="{ backgroundColor: currentAlgoColor }"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      >
        Reset Params
      </button>
      <button
        @click="emit('newPoints')"
        class="flex-1 py-3 md:py-2 px-2 text-xs md:text-sm font-bold text-white border-none rounded cursor-pointer transition-all flex items-center justify-center"
        :style="{ backgroundColor: pointsColor }"
        @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
        @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
        @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
        @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
      >
        New Points
      </button>
    </div>
  </div>
</template>
