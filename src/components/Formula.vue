<script setup lang="ts">
interface Props {
  type: 'function' | 'fitness';
  upperBound?: string;
  numPoints?: number;
}

const props = defineProps<Props>();
</script>

<template>
  <!-- Function Formula -->
  <div v-if="type === 'function'" class="flex items-center gap-1.5">
    <span>fᵢ(x) =</span>
    <div class="inline-flex flex-col items-center leading-none">
      <span class="text-[10px]">{{ upperBound }}</span>
      <span class="text-2xl md:text-3xl leading-none">Σ</span>
      <span class="text-[10px]">i=0</span>
    </div>
    <span>wᵢxⁱ</span>
  </div>

  <!-- Fitness Formula -->
  <div v-else-if="type === 'fitness'" class="flex items-center gap-1.5">
    <span>Fitness =</span>
    <div class="inline-flex flex-col items-center leading-none">
      <span class="text-[9px]">1</span>
      <span class="border-t border-white px-0.5 text-[9px]">{{ numPoints }}</span>
    </div>
    <div class="inline-flex flex-col items-center leading-none">
      <span class="text-[10px]">{{ numPoints }}</span>
      <span class="text-2xl md:text-3xl leading-none">Σ</span>
      <span class="text-[10px]">j=1</span>
    </div>
    <span>(yⱼ - fᵢ(xⱼ))²</span>
  </div>
</template>
