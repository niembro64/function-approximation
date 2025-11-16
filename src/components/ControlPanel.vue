<script setup lang="ts">
import Slider from './Slider.vue';
import type { SliderConfig } from '../types';

interface Props {
  sliderConfigs: SliderConfig[];
  thumbColor: string;
}

defineProps<Props>();
</script>

<template>
  <!-- Sliders - Mobile (normal order) -->
  <div class="mb-2 md:mb-3 flex md:hidden flex-col gap-1.5 md:gap-2 order-1 md:order-2">
    <Slider
      v-for="config in sliderConfigs"
      :key="config.label"
      :label="config.label"
      v-model="config.model.value"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      :decimals="config.decimals"
      :logarithmic="config.logarithmic"
      :logMidpoint="config.logMidpoint"
      :useScientificNotation="config.useScientificNotation"
      :thumbColor="thumbColor"
    />
  </div>

  <!-- Sliders - Desktop (reversed order) -->
  <div class="mb-2 md:mb-3 hidden md:flex flex-col gap-1.5 md:gap-2 order-1 md:order-2">
    <Slider
      v-for="config in sliderConfigs.slice().reverse()"
      :key="config.label"
      :label="config.label"
      v-model="config.model.value"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      :decimals="config.decimals"
      :logarithmic="config.logarithmic"
      :logMidpoint="config.logMidpoint"
      :useScientificNotation="config.useScientificNotation"
      :thumbColor="thumbColor"
    />
  </div>
</template>
