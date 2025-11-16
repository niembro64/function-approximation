<script setup lang="ts">
import { ALGORITHMS } from '../config';

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
              v-for="algo in ALGORITHMS"
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
                <div class="flex flex-col">
                  <span class="text-white font-medium">{{ algo.name }}</span>
                  <span class="text-ui-text text-sm">{{ algo.category }}</span>
                </div>
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
