<script setup lang="ts">
interface Props {
  isOpen: boolean;
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
              class="text-ui-text hover:text-white text-4xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <!-- Content -->
          <div class="text-ui-text-normal space-y-4">
            <section>
              <h3 class="text-xl font-bold text-white mb-2">Overview</h3>
              <p>
                This project demonstrates eight different optimization algorithms for approximating data points with polynomial functions.
                Seven algorithms iteratively optimize to minimize error, while one provides the exact algebraic solution.
                Click the algorithm button to cycle through and compare their performance.
              </p>
            </section>

            <section>
              <h3 class="text-xl font-bold text-white mb-2">Mathematical Foundation</h3>
              <div class="bg-ui-bg-dark p-4 rounded space-y-4">
                <div>
                  <h4 class="font-bold text-white mb-2 text-base">Polynomial Function</h4>
                  <div class="font-mono text-sm mb-2">
                    f(x) = w₀ + w₁x + w₂x² + w₃x³ + ... + wₙxⁿ
                  </div>
                  <p class="text-sm text-ui-text-normal">
                    Each algorithm finds optimal weights (w₀, w₁, w₂, ..., wₙ) to fit the data points.
                    Higher degree polynomials can fit more complex patterns but risk overfitting.
                  </p>
                </div>

                <div>
                  <h4 class="font-bold text-white mb-2 text-base">Fitness (Mean Squared Error)</h4>
                  <div class="font-mono text-sm mb-2">
                    MSE = (1/m) × Σ(yⱼ - f(xⱼ))²
                  </div>
                  <p class="text-sm text-ui-text-normal">
                    Measures how well the polynomial fits the data by averaging squared differences between
                    actual points (yⱼ) and predicted values (f(xⱼ)). Lower values indicate better fit.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-bold text-white mb-2">Algorithms</h3>

              <div class="space-y-3">
                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #65a30d">Genetic Algorithm</h4>
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
                  <h4 class="font-bold mb-1 text-base" style="color: #059669">Particle Swarm</h4>
                  <p class="mb-2">
                    Inspired by bird flocking behavior - a swarm of particles explores the solution space, each tracking its personal best and the global best.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Swarm:</strong> Multiple particles (solutions) move through weight space with position and velocity</li>
                    <li><strong>Personal Best:</strong> Each particle remembers its best-ever position</li>
                    <li><strong>Global Best:</strong> All particles are attracted toward the swarm's best-ever position</li>
                    <li><strong>Velocity Update:</strong> Combines inertia, personal attraction, and social attraction</li>
                    <li><strong>Parameters:</strong> # Particles, Inertia, Cognitive/Social Coefficients</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #3b82f6">Gradient Descent - Stochastic</h4>
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
                  <h4 class="font-bold mb-1 text-base" style="color: #6366f1">Gradient Descent - Momentum</h4>
                  <p class="mb-2">
                    Enhances standard gradient descent by accumulating a velocity vector, accelerating in consistent directions and dampening oscillations.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Velocity:</strong> Exponentially weighted moving average of past gradients</li>
                    <li><strong>Acceleration:</strong> Builds momentum in directions of consistent gradient descent</li>
                    <li><strong>Dampening:</strong> Reduces oscillation in directions where gradient changes sign</li>
                    <li><strong>Update:</strong> v ← βv + α∇E, then w ← w - v</li>
                    <li><strong>Parameters:</strong> Learning Rate (α), Momentum (β)</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #8b5cf6">Gradient Descent - Adam</h4>
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

                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #06b6d4">Random Search</h4>
                  <p class="mb-2">
                    Baseline algorithm with no learning - generates multiple random weight combinations per iteration while tracking the global best solution.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Pure Exploration:</strong> Each iteration generates completely random weight sets with no memory</li>
                    <li><strong>No Learning:</strong> Unlike evolutionary algorithms, there's no mutation or improvement of existing solutions</li>
                    <li><strong>Global Best:</strong> Tracks the best solution ever found across all iterations</li>
                    <li><strong>Visualization:</strong> Shows current random samples plus the best-ever solution</li>
                    <li><strong>Parameters:</strong> # Curves (how many random samples per iteration)</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #ca8a04">Simulated Annealing</h4>
                  <p class="mb-2">
                    Inspired by metallurgical annealing - accepts worse solutions probabilistically to escape local minima, cooling over time.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Temperature:</strong> Controls acceptance probability for worse solutions (high = more exploration)</li>
                    <li><strong>Cooling:</strong> Temperature decreases over time, gradually becoming more greedy</li>
                    <li><strong>Perturbation:</strong> Randomly modifies one weight per iteration</li>
                    <li><strong>Acceptance:</strong> Always accepts better solutions; accepts worse with probability e^(-ΔE/T)</li>
                    <li><strong>Parameters:</strong> Initial Temperature, Cooling Rate, Iterations</li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold mb-1 text-base" style="color: #ec4899">Polynomial Solver</h4>
                  <p class="mb-2">
                    Exact algebraic solution using linear algebra - solves the Vandermonde system to find the unique polynomial passing through the points.
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Exact Solution:</strong> Finds the exact polynomial when # coefficients ≤ # points</li>
                    <li><strong>Gaussian Elimination:</strong> Uses row reduction with partial pivoting to solve the linear system</li>
                    <li><strong>Vandermonde Matrix:</strong> Constructs A[i][j] = xᵢʲ to represent the polynomial basis</li>
                    <li><strong>No Solution:</strong> Displays message when more points than coefficients (overdetermined system)</li>
                    <li><strong>Parameters:</strong> None (solution is deterministic given the data)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-bold text-white mb-2">Controls</h3>

              <div class="mb-3">
                <h4 class="font-bold text-ui-text mb-1 text-base">Common Parameters</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Points:</strong> Number of data points to fit</li>
                  <li><strong># Weights:</strong> Degree of polynomial (number of coefficients)</li>
                  <li><strong>Speed:</strong> Iterations per second for all algorithms</li>
                  <li><strong>Weight Penalty:</strong> L2 regularization strength to prevent overfitting</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #65a30d">Genetic Algorithm</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Children:</strong> Population size per generation</li>
                  <li><strong>Mutation Variance:</strong> How much child weights can differ from parent</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #059669">Particle Swarm</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Particles:</strong> Number of solutions exploring the weight space simultaneously</li>
                  <li><strong>Inertia:</strong> How much previous velocity is retained (0-1, typically 0.7)</li>
                  <li><strong>Cognitive:</strong> Attraction strength toward particle's personal best</li>
                  <li><strong>Social:</strong> Attraction strength toward swarm's global best</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #3b82f6">Gradient Descent - Stochastic</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Learning Rate:</strong> Step size for weight updates</li>
                  <li><strong>Stochasticity:</strong> Noise level added to gradients (0 = deterministic, higher = more random exploration)</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #6366f1">Gradient Descent - Momentum</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Learning Rate:</strong> Step size for gradient descent updates</li>
                  <li><strong>Momentum:</strong> Velocity decay rate (0-1, typically 0.9)</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #8b5cf6">Gradient Descent - Adam</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Learning Rate:</strong> Base step size for updates</li>
                  <li><strong>Beta1:</strong> Momentum decay rate (typically 0.9-0.99)</li>
                  <li><strong>Beta2:</strong> RMSProp decay rate (typically 0.999)</li>
                  <li><strong>Epsilon:</strong> Numerical stability constant (typically 1e-8)</li>
                </ul>
              </div>

              <div class="mb-3">
                <h4 class="font-bold mb-1" style="color: #06b6d4">Random Search</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong># Curves:</strong> Number of random weight combinations to test per iteration</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold mb-1" style="color: #ca8a04">Simulated Annealing</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Initial Temp:</strong> Starting temperature for acceptance probability</li>
                  <li><strong>Cooling Rate:</strong> Multiplicative factor per iteration (0-1, typically 0.995-0.999)</li>
                  <li><strong>Iterations:</strong> Number of perturbations attempted per frame</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-bold text-white mb-2">Interaction</h3>
              <p class="mb-2">
                Click and drag the colored points on the canvas to move them. All algorithms will continuously
                adapt to find the best polynomial fit for your custom data configuration.
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li><strong>Algorithm Button:</strong> Cycle through all seven optimization algorithms</li>
                <li><strong>Reset Algo:</strong> Restart the current algorithm from a fresh state</li>
                <li><strong>Reset Params:</strong> Reset all sliders to their default values</li>
                <li><strong>New Points:</strong> Generate a new random set of data points</li>
              </ul>
            </section>
          </div>

          <!-- Close Button -->
          <div class="mt-6 flex justify-end">
            <button
              @click="handleClose"
              class="px-4 py-2 bg-primary text-white border-none rounded cursor-pointer transition-all"
              style="filter: brightness(1)"
              @mouseover="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
              @mouseout="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
              @mousedown="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.8)'"
              @mouseup="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'"
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
