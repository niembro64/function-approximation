<script setup lang="ts">
import Formula from './Formula.vue';

interface Props {
  isOpen: boolean;
  upperBound: string;
  numPoints: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close': [];
}>();

const handleClose = (): void => {
  emit('close');
};

const handleBackdropClick = (event: MouseEvent): void => {
  if (event.target === event.currentTarget) {
    handleClose();
  }
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
          class="bg-ui-bg border-2 border-ui-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">Genetic Algorithm Function Approximation</h2>
            <button
              @click="handleClose"
              class="text-ui-text hover:text-white text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <!-- Content -->
          <div class="text-ui-text-normal space-y-4">
            <section>
              <h3 class="text-lg font-bold text-white mb-2">Overview</h3>
              <p>
                This project uses a genetic algorithm to approximate data points with polynomial functions.
                The algorithm evolves a population of candidate solutions (polynomials) over generations,
                continuously improving their fitness by minimizing the error between predicted and actual values.
              </p>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">Mathematical Formulas</h3>
              <div class="bg-ui-bg-dark p-4 rounded font-mono text-sm md:text-base space-y-3">
                <div class="flex items-center gap-2">
                  <Formula type="function" :upperBound="upperBound" />
                </div>
                <div class="flex items-center gap-2">
                  <Formula type="fitness" :numPoints="numPoints" />
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">How It Works</h3>
              <ul class="list-disc list-inside space-y-2">
                <li>
                  <strong>Population:</strong> Multiple polynomial functions (children) compete each generation
                </li>
                <li>
                  <strong>Fitness:</strong> Measured by Mean Squared Error (MSE) - lower is better
                </li>
                <li>
                  <strong>Selection:</strong> The best-performing function is chosen as the parent
                </li>
                <li>
                  <strong>Mutation:</strong> Child functions are created by adding random variations to the parent's weights
                </li>
                <li>
                  <strong>Evolution:</strong> This process repeats continuously, gradually improving the fit
                </li>
              </ul>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">Controls</h3>
              <ul class="list-disc list-inside space-y-2">
                <li>
                  <strong># Points:</strong> Number of data points to fit
                </li>
                <li>
                  <strong># Weights:</strong> Degree of polynomial (number of coefficients)
                </li>
                <li>
                  <strong># Children:</strong> Population size per generation
                </li>
                <li>
                  <strong>Speed:</strong> Generations per second
                </li>
                <li>
                  <strong>Mutation Variance:</strong> How much child weights can differ from parent
                </li>
                <li>
                  <strong>Weight Penalty:</strong> Regularization to prevent overfitting by penalizing large weights
                </li>
              </ul>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">Interaction</h3>
              <p>
                Click and drag the green points on the canvas to move them. The algorithm will continuously
                adapt to find the best polynomial fit for your custom data configuration.
              </p>
            </section>
          </div>

          <!-- Close Button -->
          <div class="mt-6 flex justify-end">
            <button
              @click="handleClose"
              class="px-4 py-2 bg-primary text-white border-none rounded cursor-pointer transition-all hover:bg-primary-hover active:translate-y-px"
            >
              Close
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
