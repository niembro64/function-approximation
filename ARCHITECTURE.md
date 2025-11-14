# Project Architecture

This document outlines the architecture and organization of the Function Approximation project.

## Directory Structure

```
src/
├── components/          # Vue components
│   ├── FunctionApproximation.vue  # Main application component
│   ├── Slider.vue                 # Reusable slider component
│   ├── WeightCell.vue             # Individual weight cell display
│   ├── InfoModal.vue              # Information modal
│   └── Formula.vue                # Mathematical formula display
├── composables/         # Reusable composition functions
│   ├── useGeneticAlgorithm.ts     # Genetic algorithm logic
│   ├── useGradientDescent.ts      # Gradient descent logic
│   ├── useAdamOptimizer.ts        # Adam optimizer logic
│   └── useCanvasRenderer.ts       # Canvas rendering logic
├── constants/           # Configuration and constants
│   └── config.ts                  # All application constants
├── types/              # TypeScript type definitions
│   └── index.ts                   # Shared interfaces and types
├── utils/              # Utility functions
│   ├── formatters.ts              # Number formatting utilities
│   └── math.ts                    # Mathematical utilities
├── App.vue             # Root Vue component
└── main.ts             # Application entry point
```

## Core Concepts

### Types (`src/types/index.ts`)

All shared TypeScript interfaces and types:
- `Point`: Represents a data point with x and y coordinates
- `Curve`: Represents a polynomial function with weights and fitness
- `CanvasCoords`: Canvas pixel coordinates
- `CoordSystemCoords`: Mathematical coordinate system coordinates
- `SliderConfig`: Configuration for slider components
- `SolutionMethod`: Type union for algorithm selection
- `AdamState`: State for Adam optimizer (momentum and RMSProp)

### Constants (`src/constants/config.ts`)

Centralized configuration:
- Color constants for UI theming
- Canvas rendering constants (sizes, paddings, line widths)
- Slider range constants for all parameters
- Algorithm-specific parameter ranges

### Utilities

#### Math Utilities (`src/utils/math.ts`)
- `randomNormal()`: Generate random numbers from normal distribution
- `evaluateCurve()`: Evaluate polynomial at given x
- `calculateFitness()`: Calculate MSE with optional L2 regularization
- `generateRandomWeights()`: Create random weight arrays
- `isMobile()`: Detect mobile devices

#### Formatters (`src/utils/formatters.ts`)
- `generateScientificNotation()`: Format numbers in scientific notation with explicit signs

### Composables

#### Genetic Algorithm (`src/composables/useGeneticAlgorithm.ts`)
Manages evolutionary optimization:
- `generateCurves()`: Create initial population
- `evolutionStep()`: Perform one generation of evolution
- `updateFitness()`: Recalculate fitness for all curves

#### Gradient Descent (`src/composables/useGradientDescent.ts`)
Implements gradient-based optimization:
- `generateSingleCurve()`: Create initial curve
- `gradientDescentStep()`: Perform one gradient descent iteration
- `updateFitness()`: Recalculate fitness

Supports stochastic gradient descent with configurable noise.

#### Adam Optimizer (`src/composables/useAdamOptimizer.ts`)
Implements adaptive moment estimation:
- `generateSingleCurve()`: Create initial curve
- `adamStep()`: Perform one Adam optimization iteration
- `updateFitness()`: Recalculate fitness

Maintains internal state for momentum (m) and RMSProp (v).

#### Canvas Renderer (`src/composables/useCanvasRenderer.ts`)
Handles all canvas drawing operations:
- `draw()`: Main rendering function
- `drawGrid()`: Render coordinate grid
- `drawAxes()`: Render x and y axes
- `drawCurves()`: Render polynomial curves
- `drawErrorBars()`: Render error bars from points to best fit
- `drawPoints()`: Render data points
- `drawLabels()`: Render axis labels
- `drawFitness()`: Render fitness display
- `toCanvasCoords()`: Convert math coords to canvas pixels
- `fromCanvasCoords()`: Convert canvas pixels to math coords

### Components

#### FunctionApproximation.vue
Main application component that:
- Manages application state (points, curves, parameters)
- Orchestrates algorithm execution
- Handles user interactions (dragging points, changing algorithms)
- Coordinates rendering and updates

#### Slider.vue
Reusable slider component with:
- Linear and logarithmic scaling
- Scientific notation display
- Custom thumb colors
- Responsive sizing

#### WeightCell.vue
Displays individual polynomial weights with:
- Color-coded visualization (red=negative, blue=positive)
- Intensity based on magnitude
- Scientific notation formatting

#### InfoModal.vue
Information modal displaying:
- Project overview
- Mathematical formulas
- Algorithm descriptions
- Control explanations
- Interaction instructions

#### Formula.vue
Renders LaTeX-style mathematical formulas for:
- Polynomial function definition
- Fitness function (MSE with L2 regularization)

## Coding Standards

### TypeScript
- All functions have explicit return types
- Use `null` instead of `undefined` for optional values
- Full type annotations on all variables
- Interfaces for all data structures

### Vue 3
- Composition API with `<script setup>`
- TypeScript with strict typing
- Reactive refs and computed properties
- Proper event emission typing

### Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants
- Descriptive names that explain purpose

### Code Organization
- Extract reusable logic into composables
- Centralize constants and configuration
- Keep components focused and single-purpose
- Use utility functions for common operations
