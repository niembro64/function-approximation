import { ref, type Ref } from 'vue';
import type { Curve, Point } from '../types';
import { randomNormal, calculateFitness, generateRandomWeights } from '../utils/math';

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
        fitness: 0,
      };
      curve.fitness = calculateFitness(curve, points, weightPenalty);
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
      (a: Curve, b: Curve) => a.fitness - b.fitness
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
        fitness: 0,
      };
      child.fitness = calculateFitness(child, points, weightPenalty);
      newCurves.push(child);
    }

    curves.value = newCurves;
  }

  /**
   * Update fitness for all curves (used when points or penalty changes)
   */
  function updateFitness(points: Point[], weightPenalty: number): void {
    for (const curve of curves.value) {
      curve.fitness = calculateFitness(curve, points, weightPenalty);
    }
  }

  return {
    curves,
    generateCurves,
    evolutionStep,
    updateFitness,
  };
}
