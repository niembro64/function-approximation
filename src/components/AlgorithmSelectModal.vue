<script setup lang="ts">
interface Props {
  isOpen: boolean;
  currentAlgorithm: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close': [];
  'select': [algorithm: string];
}>();

const handleClose = (): void => {
  emit('close');
};

const handleBackdropClick = (event: MouseEvent): void => {
  if (event.target === event.currentTarget) {
    handleClose();
  }
};

const selectAlgorithm = (algorithm: string): void => {
  emit('select', algorithm);
  handleClose();
};

const algorithms = [
  { id: 'gradient', name: 'Gradient Descent - Stochastic', color: '#3b82f6' },
  { id: 'momentum', name: 'Gradient Descent - Momentum', color: '#6366f1' },
  { id: 'adam', name: 'Gradient Descent - Adam', color: '#8b5cf6' },
  { id: 'genetic', name: 'Genetic Algorithm', color: '#65a30d' },
  { id: 'particle-swarm', name: 'Particle Swarm', color: '#059669' },
  { id: 'random-search', name: 'Random Search', color: '#06b6d4' },
  { id: 'simulated-annealing', name: 'Simulated Annealing', color: '#ca8a04' },
  { id: 'polynomial-solver', name: 'Polynomial Solver', color: '#ec4899' },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        @click="handleBackdropClick"
      >
        <div
          class="bg-ui-bg border-2 border-ui-border rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">Select Algorithm</h2>
            <button
              @click="handleClose"
              class="text-ui-text hover:text-white text-4xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <!-- Algorithm List -->
          <div class="space-y-2">
            <button
              v-for="algo in algorithms"
              :key="algo.id"
              @click="selectAlgorithm(algo.id)"
              class="w-full text-left px-4 py-3 rounded transition-all border-2"
              :class="
                currentAlgorithm === algo.id
                  ? 'border-white bg-ui-bg-highlight'
                  : 'border-transparent bg-ui-bg-dark hover:bg-ui-bg-hover'
              "
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: algo.color }"
                ></div>
                <span class="text-white font-medium">{{ algo.name }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
