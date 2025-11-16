import { ref, type Ref } from 'vue';
import type { Curve, Point, AdamState } from '../types';
import { calculateLoss, generateRandomWeights } from '../utils/math';

export function useAdamOptimizer() {
  const curves = ref<Curve[]>([]);
  const adamState = ref<AdamState | null>(null);
  let nextCurveId = 1;

  /**
   * Generate initial curve for Adam optimizer
   */
  function generateSingleCurve(
    numWeights: number,
    points: Point[],
    weightPenalty: number
  ): void {
    const weights: number[] = generateRandomWeights(numWeights);
    const curve: Curve = {
      id: nextCurveId++,
      weights,
      loss: 0,
    };
    curve.loss = calculateLoss(curve, points, weightPenalty);
    curves.value = [curve];

    // Reset Adam state
    adamState.value = {
      m: new Array(numWeights).fill(0),
      v: new Array(numWeights).fill(0),
      t: 0,
    };
  }

  /**
   * Perform one step of Adam optimization
   */
  function adamStep(
    numWeights: number,
    learningRate: number,
    beta1: number,
    beta2: number,
    epsilon: number,
    points: Point[],
    weightPenalty: number
  ): void {
    if (curves.value.length === 0 || adamState.value === null) return;

    const curve: Curve = curves.value[0];
    const state: AdamState = adamState.value;
    const gradients: number[] = [];

    // Initialize gradients
    for (let i: number = 0; i < numWeights; i++) {
      gradients.push(0);
    }

    // Compute gradients
    for (const point of points) {
      let predicted: number = 0;
      for (let i: number = 0; i < curve.weights.length; i++) {
        predicted += curve.weights[i] * Math.pow(point.x, i);
      }
      const error: number = predicted - point.y;

      for (let i: number = 0; i < curve.weights.length; i++) {
        gradients[i] += (2 * error * Math.pow(point.x, i)) / points.length;
      }
    }

    // Add L2 regularization gradient
    if (weightPenalty > 0) {
      for (let i: number = 0; i < curve.weights.length; i++) {
        gradients[i] += 2 * weightPenalty * curve.weights[i];
      }
    }

    // Update Adam state
    state.t += 1;

    for (let i: number = 0; i < curve.weights.length; i++) {
      // Update biased first moment estimate
      state.m[i] = beta1 * state.m[i] + (1 - beta1) * gradients[i];

      // Update biased second raw moment estimate
      state.v[i] = beta2 * state.v[i] + (1 - beta2) * gradients[i] * gradients[i];

      // Compute bias-corrected first moment estimate
      const mHat: number = state.m[i] / (1 - Math.pow(beta1, state.t));

      // Compute bias-corrected second raw moment estimate
      const vHat: number = state.v[i] / (1 - Math.pow(beta2, state.t));

      // Update weights
      curve.weights[i] -= (learningRate * mHat) / (Math.sqrt(vHat) + epsilon);
    }

    // Update loss
    curve.loss = calculateLoss(curve, points, weightPenalty);
  }

  /**
   * Update loss for the curve (used when points or penalty changes)
   */
  function updateLoss(points: Point[], weightPenalty: number): void {
    if (curves.value.length > 0) {
      curves.value[0].loss = calculateLoss(curves.value[0], points, weightPenalty);
    }
  }

  return {
    curves,
    adamState,
    generateSingleCurve,
    adamStep,
    updateLoss,
  };
}
