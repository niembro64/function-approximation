import { ref, type Ref } from 'vue';
import type { Curve, Point } from '../types';
import { randomNormal, calculateLoss, generateRandomWeights } from '../utils/math';

export function useGeneticAlgorithm() {
  const curves = ref<Curve[]>([]);
  let nextCurveId = 1;

  /**
   * Generate initial population of curves
   */
  function generateCurves(
    numChildren: number,
    numWeights: number,
    points: Point[],
    weightPenalty: number
  ): void {
    curves.value = [];
    for (let i: number = 0; i < numChildren; i++) {
      const weights: number[] = generateRandomWeights(numWeights);
      const curve: Curve = {
        id: nextCurveId++,
        weights,
        loss: 0,
      };
      curve.loss = calculateLoss(curve, points, weightPenalty);
      curves.value.push(curve);
    }
  }

  /**
   * Perform one generation of genetic algorithm evolution
   */
  function evolutionStep(
    numChildren: number,
    numWeights: number,
    mutationVariance: number,
    points: Point[],
    weightPenalty: number
  ): void {
    if (curves.value.length === 0) return;

    // Find best curve (parent)
    const sortedCurves: Curve[] = [...curves.value].sort(
      (a: Curve, b: Curve) => a.loss - b.loss
    );
    const parent: Curve = sortedCurves[0];

    // Generate children by mutating parent
    const newCurves: Curve[] = [];
    for (let i: number = 0; i < numChildren; i++) {
      const childWeights: number[] = [];
      for (let j: number = 0; j < numWeights; j++) {
        const mutation: number = randomNormal(0, mutationVariance);
        childWeights.push(parent.weights[j] + mutation);
      }

      const child: Curve = {
        id: nextCurveId++,
        weights: childWeights,
        loss: 0,
      };
      child.loss = calculateLoss(child, points, weightPenalty);
      newCurves.push(child);
    }

    curves.value = newCurves;
  }

  /**
   * Update loss for all curves (used when points or penalty changes)
   */
  function updateLoss(points: Point[], weightPenalty: number): void {
    for (const curve of curves.value) {
      curve.loss = calculateLoss(curve, points, weightPenalty);
    }
  }

  return {
    curves,
    generateCurves,
    evolutionStep,
    updateLoss,
  };
}
