import type { Curve, Point } from '../types';

/**
 * Generate random number from normal distribution using Box-Muller transform
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  const u1: number = Math.random();
  const u2: number = Math.random();
  const z0: number = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Evaluate polynomial curve at given x
 */
export function evaluateCurve(curve: Curve, x: number): number {
  let y: number = 0;
  for (let i: number = 0; i < curve.weights.length; i++) {
    y += curve.weights[i] * Math.pow(x, i);
  }
  return y;
}

/**
 * Calculate mean squared error loss with optional L2 regularization
 */
export function calculateLoss(
  curve: Curve,
  points: Point[],
  weightPenalty: number = 0
): number {
  let mse: number = 0;
  for (const point of points) {
    const predicted: number = evaluateCurve(curve, point.x);
    const error: number = predicted - point.y;
    mse += error * error;
  }
  mse /= points.length;

  // Add L2 regularization penalty
  if (weightPenalty > 0) {
    let weightSum: number = 0;
    for (const weight of curve.weights) {
      weightSum += weight * weight;
    }
    mse += weightPenalty * weightSum;
  }

  return mse;
}

/**
 * Generate random weights array
 */
export function generateRandomWeights(numWeights: number): number[] {
  const weights: number[] = [];
  for (let i: number = 0; i < numWeights; i++) {
    weights.push(randomNormal(0, 1));
  }
  return weights;
}

/**
 * Check if device is mobile based on window width
 */
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}
