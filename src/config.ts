import type { SolutionMethod, AlgorithmInfo } from './types';

// ============================================================
// Tailwind Color Palette
// ============================================================

const TAILWIND_COLORS = {
  purple500: '#a855f7',
  violet500: '#8b5cf6',
  indigo500: '#6366f1',
  blue500: '#3b82f6',
  cyan500: '#06b6d4',
  cyan600: '#0891b2',
  green600: '#16a34a',
  lime700: '#65a30d',
  emerald600: '#059669',
  yellow600: '#ca8a04',
  pink500: '#ec4899',
  fuchsia500: '#d946ef',
  red500: '#fb2c36',
} as const;

// ============================================================
// Main Configuration Object
// ============================================================

export const CONFIG = {
  // Colors
  colors: {
    tailwind: TAILWIND_COLORS,
    points: {
      darkGray: '#4a4a4a',
      gray: '#888888',
    },
    algorithms: {
      genetic: TAILWIND_COLORS.lime700,
      particleSwarm: TAILWIND_COLORS.emerald600,
      gradient: TAILWIND_COLORS.cyan600,
      momentum: TAILWIND_COLORS.indigo500,
      adam: TAILWIND_COLORS.purple500,
      simulatedAnnealing: TAILWIND_COLORS.yellow600,
      polynomialSolver: TAILWIND_COLORS.pink500,
      randomSearch: TAILWIND_COLORS.fuchsia500,
    },
    canvas: {
      background: '#1a1a1a',
      grid: '#333',
      axes: '#666',
      labels: '#aaa',
      errorBars: TAILWIND_COLORS.red500,
      pointBorder: '#ffffff',
    },
    drawing: {
      otherCurve: '#666666',
    },
  },

  // Slider Ranges
  sliders: {
    points: {
      min: 1,
      max: 24,
    },
    weights: {
      min: 1,
      max: 24,
    },
    children: {
      min: 2,
      max: 64,
    },
    speed: {
      min: 1,
      max: 256,
    },
    mutationVariance: {
      min: 0.01,
      max: 2,
    },
    weightPenalty: {
      min: 0,
      max: 1,
    },
    learningRate: {
      min: 0.0001,
      max: 1,
    },
    stochasticity: {
      min: 0,
      max: 3,
    },
    adam: {
      learningRate: { min: 0.0001, max: 1 },
      beta1: { min: 0, max: 0.999 },
      beta2: { min: 0, max: 0.9999 },
      epsilon: { min: 1e-10, max: 1e-6 },
    },
    simulatedAnnealing: {
      initialTemp: { min: 0.1, max: 10 },
      coolingRate: { min: 0.9, max: 0.9999 },
      iterations: { min: 1, max: 100 },
    },
    particleSwarm: {
      particles: { min: 2, max: 64 },
      inertia: { min: 0, max: 1 },
      cognitive: { min: 0, max: 4 },
      social: { min: 0, max: 4 },
    },
    momentum: {
      learningRate: { min: 0.0001, max: 1 },
      beta: { min: 0, max: 0.999 },
    },
    randomSearch: {
      curves: { min: 2, max: 64 },
    },
  },

  // Default Values
  defaults: {
    desktop: {
      points: 5,
      weights: 5,
      children: 5,
      speed: 60,
      mutationVariance: 1,
      weightPenalty: 0,
      learningRate: 0.1,
      stochasticity: 0,
      adam: {
        learningRate: 0.1,
        beta1: 0.97,
        beta2: 0.999,
        epsilon: 1e-8,
      },
      simulatedAnnealing: {
        initialTemp: 1,
        coolingRate: 0.995,
        iterations: 10,
      },
      particleSwarm: {
        particles: 5,
        inertia: 0.7,
        cognitive: 1.5,
        social: 1.5,
      },
      momentum: {
        learningRate: 0.1,
        beta: 0.9,
      },
      randomSearch: {
        curves: 5,
      },
    },
    mobile: {
      points: 5,
      weights: 5,
      children: 5,
      speed: 60,
      mutationVariance: 1,
      weightPenalty: 0,
      learningRate: 0.1,
      stochasticity: 0,
      adam: {
        learningRate: 0.1,
        beta1: 0.97,
        beta2: 0.999,
        epsilon: 1e-8,
      },
      simulatedAnnealing: {
        initialTemp: 1,
        coolingRate: 0.995,
        iterations: 10,
      },
      particleSwarm: {
        particles: 5,
        inertia: 0.7,
        cognitive: 1.5,
        social: 1.5,
      },
      momentum: {
        learningRate: 0.1,
        beta: 0.9,
      },
      randomSearch: {
        curves: 5,
      },
    },
  },

  // Drawing Configuration
  drawing: {
    pointRadius: 8,
    dot: {
      borderWidth: 3,
    },
    curves: {
      bestLineWidth: 5,
      otherLineWidth: 2,
      otherOpacity: 0.5,
    },
    errorBars: {
      lineWidth: 3,
    },
    grid: {
      lineWidth: 1,
    },
    axes: {
      lineWidth: 2,
    },
  },

  // Mutation Configuration
  mutation: {
    distributionType: 'normal' as const,
    minVariance: 0.0,
    varianceExponent: 1,
    weightVarianceScales: [1.0],
    adaptiveVariance: {
      enabled: true,
      minScale: 0.01,
      maxScale: 1.0,
      lossTarget: 0.1,
    },
    weightProportional: {
      enabled: true,
      factor: 0.5,
      min: 0.1,
    },
  },

  // Coordinate System
  coordinates: {
    min: -1,
    max: 1,
    curveHorizontalOverdraw: 1.0,
  },

  // Canvas Configuration
  canvas: {
    scale: 2,
    padding: 25,
    minSize: 350,
    minSizeMobile: 280,
    viewportHeightOffset: 60,
    viewportHeightOffsetMobile: 450,
    viewportWidthOffset: 660,
    viewportWidthOffsetMobile: 40,
    mobileBreakpoint: 768,
    curveResolution: {
      primary: 300,
      auxiliary: 80,
    },
  },

  // Algorithm Order
  algorithmOrder: [
    'gradient',
    'momentum',
    'adam',
    'genetic',
    'particle-swarm',
    'simulated-annealing',
    'random-search',
    'polynomial-solver',
  ] as SolutionMethod[],

  // Algorithm Information
  algorithms: [
    { id: 'gradient', name: 'Stochastic', fullName: 'Stochastic Gradient Descent', category: 'Gradient Descent', color: TAILWIND_COLORS.cyan600 },
    { id: 'momentum', name: 'Momentum', fullName: 'Momentum-Based Gradient Descent', category: 'Gradient Descent', color: TAILWIND_COLORS.indigo500 },
    { id: 'adam', name: 'Adam', fullName: 'Adam Optimizer', category: 'Gradient Descent', color: TAILWIND_COLORS.purple500 },
    { id: 'genetic', name: 'Genetic', fullName: 'Genetic Algorithm', category: 'Evolutionary', color: TAILWIND_COLORS.lime700 },
    { id: 'particle-swarm', name: 'Particle', fullName: 'Particle Swarm Optimization', category: 'Swarm Intelligence', color: TAILWIND_COLORS.emerald600 },
    { id: 'random-search', name: 'Random', fullName: 'Random Search', category: 'Baseline', color: TAILWIND_COLORS.fuchsia500 },
    { id: 'simulated-annealing', name: 'Annealing', fullName: 'Simulated Annealing', category: 'Metaheuristic', color: TAILWIND_COLORS.yellow600 },
    { id: 'polynomial-solver', name: 'Solve', fullName: 'Exact Polynomial Solver', category: 'Baseline', color: TAILWIND_COLORS.pink500 },
  ] as AlgorithmInfo[],

  // Utility Functions
  utils: {
    isMobile: (): boolean => window.innerWidth < 768,

    getAlgoInfo: (solutionMethod: SolutionMethod): AlgorithmInfo => {
      const info = CONFIG.algorithms.find(algo => algo.id === solutionMethod);
      if (!info) {
        throw new Error(`Unknown solution method: ${solutionMethod}`);
      }
      return info;
    },

    getAlgoColor: (solutionMethod: SolutionMethod): string => {
      return CONFIG.utils.getAlgoInfo(solutionMethod).color;
    },
  },
} as const;

// Export individual items for backward compatibility (temporary)
export const isMobile = CONFIG.utils.isMobile;
export const getAlgoInfo = CONFIG.utils.getAlgoInfo;
export const getAlgoColor = CONFIG.utils.getAlgoColor;
