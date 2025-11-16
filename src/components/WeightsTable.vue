<script setup lang="ts">
import WeightCell from './WeightCell.vue';
import type { Curve, SolutionMethod } from '../types';

interface Props {
  sortedCurves: Curve[];
  numWeights: number;
  solutionMethod: SolutionMethod;
  formatScientific: (value: number, decimals: number) => string;
}

defineProps<Props>();
</script>

<template>
  <!-- Table Header -->
  <div class="hidden md:flex bg-ui-bg-dark font-bold text-ui-text text-xs shrink-0 order-3">
    <div class="flex-1 flex">
      <div
        v-for="wIndex in numWeights"
        :key="wIndex"
        class="flex-1 text-center flex items-center justify-center"
        :class="numWeights > 6 && numWeights <= 20 ? 'text-[10px]' : 'text-sm'"
      >
        <template v-if="numWeights > 20">
          <!-- No text for more than 20 columns -->
        </template>
        <template v-else-if="numWeights > 6">
          {{ wIndex - 1 }}
        </template>
        <template v-else>
          <template v-if="wIndex === 1">1</template>
          <template v-else-if="wIndex === 2">x</template>
          <template v-else>x<sup>{{ wIndex - 1 }}</sup></template>
        </template>
      </div>
    </div>
    <div class="w-20 text-center flex items-center justify-center">Loss</div>
  </div>

  <!-- Table Rows -->
  <div class="flex-1 overflow-hidden hidden md:flex flex-col order-4">
    <div
      v-for="(curve, index) in sortedCurves"
      :key="curve.id"
      class="flex font-mono text-xs transition-colors"
      :class="
        index === 0 ||
        (solutionMethod !== 'genetic' &&
          solutionMethod !== 'particle-swarm' &&
          solutionMethod !== 'random-search')
          ? 'bg-ui-bg-highlight'
          : 'bg-ui-bg-dark hover:bg-ui-bg-hover'
      "
    >
      <div class="flex-1 flex">
        <WeightCell
          v-for="(weight, wIndex) in curve.weights"
          :key="wIndex"
          :weight="weight"
          :index="wIndex"
          :showFormula="numWeights < 6"
        />
      </div>
      <div
        class="w-20 flex items-center justify-center font-bold text-ui-text text-xs md:text-sm font-mono"
      >
        {{ formatScientific(curve.loss, 2) }}
      </div>
    </div>
  </div>
</template>
