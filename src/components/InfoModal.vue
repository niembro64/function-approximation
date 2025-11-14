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
            <h2 class="text-2xl font-bold text-white">Function Approximation</h2>
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
                This project demonstrates three different optimization algorithms for approximating data points with polynomial functions.
                Each algorithm continuously improves its solution by minimizing the error between predicted and actual values.
                Click the title button to switch between algorithms and compare their performance.
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
              <h3 class="text-lg font-bold text-white mb-2">Algorithms</h3>

              <div class="space-y-3">
                <div>
                  <h4 class="font-bold text-green-600 mb-1">Genetic Algorithm</h4>
                  <p class="mb-2">
                    Evolves a population of candidate solutions through natural selection and mutation.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Population:</strong> Multiple polynomial functions (children) compete each generation</li>
                    <li><strong>Selection:</strong> The best-performing function becomes the parent</li>
                    <li><strong>Mutation:</strong> Children are created by adding random variations to parent weights</li>
                    <li><strong>Parameters:</strong> # Children, Mutation Variance</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold text-blue-500 mb-1">Gradient Descent</h4>
                  <p class="mb-2">
                    Uses calculus to compute the gradient (slope) of the error function and updates weights in the direction that reduces error.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Gradient:</strong> Computes partial derivatives of MSE with respect to each weight</li>
                    <li><strong>Update:</strong> w ← w - α∇E (weight minus learning rate times gradient)</li>
                    <li><strong>Stochasticity:</strong> Adds Gaussian noise to gradients for exploration and escaping local minima</li>
                    <li><strong>Regularization:</strong> L2 penalty prevents overfitting by penalizing large weights</li>
                    <li><strong>Parameters:</strong> Learning Rate (α), Stochasticity</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold text-yellow-600 mb-1">Adam Optimizer</h4>
                  <p class="mb-2">
                    Adaptive Moment Estimation - combines momentum and adaptive learning rates for faster, more stable convergence.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Momentum (β₁):</strong> Exponential moving average of gradients for smoother updates</li>
                    <li><strong>RMSProp (β₂):</strong> Exponential moving average of squared gradients for adaptive learning rates</li>
                    <li><strong>Bias Correction:</strong> Adjusts moment estimates during early iterations</li>
                    <li><strong>Parameters:</strong> Learning Rate, Beta1, Beta2, Epsilon</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">Controls</h3>

              <div class="mb-3">
                <h4 class="font-bold text-ui-text mb-1">Common Parameters</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Points:</strong> Number of data points to fit</li>
                  <li><strong># Weights:</strong> Degree of polynomial (number of coefficients)</li>
                  <li><strong>Speed:</strong> Iterations per second for all algorithms</li>
                  <li><strong>Weight Penalty:</strong> L2 regularization strength to prevent overfitting</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold text-green-600 mb-1">Genetic Algorithm</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Children:</strong> Population size per generation</li>
                  <li><strong>Mutation Variance:</strong> How much child weights can differ from parent</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold text-blue-500 mb-1">Gradient Descent</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Learning Rate:</strong> Step size for weight updates</li>
                  <li><strong>Stochasticity:</strong> Noise level added to gradients (0 = deterministic, higher = more random exploration)</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-yellow-600 mb-1">Adam Optimizer</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Learning Rate:</strong> Base step size for updates</li>
                  <li><strong>Beta1:</strong> Momentum decay rate (typically 0.9-0.99)</li>
                  <li><strong>Beta2:</strong> RMSProp decay rate (typically 0.999)</li>
                  <li><strong>Epsilon:</strong> Numerical stability constant (typically 1e-8)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 class="text-lg font-bold text-white mb-2">Interaction</h3>
              <p>
                Click and drag the colored points on the canvas to move them. All algorithms will continuously
                adapt to find the best polynomial fit for your custom data configuration. Click the title button
                to cycle through different algorithms and observe how they approach the same problem differently.
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
