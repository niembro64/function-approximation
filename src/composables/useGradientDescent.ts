import { ref, type Ref } from 'vue';
import type { Curve, Point } from '../types';
import { randomNormal, calculateFitness, generateRandomWeights } from '../utils/math';

export function useGradientDescent() {
  const curves = ref<Curve[]>([]);
  let nextCurveId = 1;

  /**
   * Generate initial curve for gradient descent
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
      fitness: 0,
    };
    curve.fitness = calculateFitness(curve, points, weightPenalty);
    curves.value = [curve];
  }

  /**
   * Perform one step of gradient descent
   */
  function gradientDescentStep(
    numWeights: number,
    learningRate: number,
    stochasticity: number,
    points: Point[],
    weightPenalty: number
  ): void {
    if (curves.value.length === 0) return;

    const curve: Curve = curves.value[0];
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

    // Add stochastic noise to gradients
    if (stochasticity > 0) {
      for (let i: number = 0; i < gradients.length; i++) {
        const gradientMagnitude: number = Math.abs(gradients[i]);
        const noiseMagnitude: number = gradientMagnitude * stochasticity;
        const noise: number = randomNormal(0, noiseMagnitude);
        gradients[i] += noise;
      }
    }

    // Update weights
    for (let i: number = 0; i < curve.weights.length; i++) {
      curve.weights[i] -= learningRate * gradients[i];
    }

    // Update fitness
    curve.fitness = calculateFitness(curve, points, weightPenalty);
  }

  /**
   * Update fitness for the curve (used when points or penalty changes)
   */
  function updateFitness(points: Point[], weightPenalty: number): void {
    if (curves.value.length > 0) {
      curves.value[0].fitness = calculateFitness(curves.value[0], points, weightPenalty);
    }
  }

  return {
    curves,
    generateSingleCurve,
    gradientDescentStep,
    updateFitness,
  };
}
