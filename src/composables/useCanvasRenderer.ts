import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { Curve, Point, CanvasCoords, CoordSystemCoords } from '../types';
import { evaluateCurve } from '../utils/math';
import {
  CANVAS_SCALE,
  PADDING,
  COORD_MIN,
  COORD_MAX,
  CURVE_HORIZONTAL_OVERDRAW,
  CURVE_RESOLUTION,
  COLOR_BACKGROUND,
  COLOR_GRID,
  COLOR_AXES,
  COLOR_LABELS,
  COLOR_ERROR_BARS,
  COLOR_POINT_BORDER,
  GRID_LINE_WIDTH,
  AXIS_LINE_WIDTH,
  BEST_CURVE_LINE_WIDTH,
  OTHER_CURVE_LINE_WIDTH,
  OTHER_CURVE_OPACITY,
  ERROR_BAR_LINE_WIDTH,
  POINT_RADIUS,
  DOT_BORDER_WIDTH,
} from '../constants/config';

export function useCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  formatScientific: (value: number, decimals: number) => string
) {
  const CANVAS_SIZE = ref<number>(600);

  /**
   * Calculate canvas size based on window dimensions
   */
  function calculateCanvasSize(): void {
    if (typeof window === 'undefined') return;

    const windowWidth: number = window.innerWidth;
    const windowHeight: number = window.innerHeight;

    if (windowWidth >= 768) {
      // Desktop: 66% of viewport width or height, whichever is smaller
      const maxWidth: number = windowWidth * 0.66;
      const maxHeight: number = windowHeight;
      CANVAS_SIZE.value = Math.min(maxWidth, maxHeight, 800);
    } else {
      // Mobile: full width
      CANVAS_SIZE.value = Math.min(windowWidth, windowHeight * 0.6, 600);
    }
  }

  /**
   * Convert coordinate system coords to canvas coords
   */
  function toCanvasCoords(x: number, y: number): CanvasCoords {
    const range: number = COORD_MAX - COORD_MIN;
    const cx: number = PADDING + ((x - COORD_MIN) / range) * (CANVAS_SIZE.value - 2 * PADDING);
    const cy: number =
      CANVAS_SIZE.value - PADDING - ((y - COORD_MIN) / range) * (CANVAS_SIZE.value - 2 * PADDING);
    return { cx, cy };
  }

  /**
   * Convert canvas coords to coordinate system coords
   */
  function fromCanvasCoords(cx: number, cy: number): CoordSystemCoords {
    const range: number = COORD_MAX - COORD_MIN;
    const x: number = COORD_MIN + ((cx - PADDING) / (CANVAS_SIZE.value - 2 * PADDING)) * range;
    const y: number =
      COORD_MIN + ((CANVAS_SIZE.value - PADDING - cy) / (CANVAS_SIZE.value - 2 * PADDING)) * range;
    return { x, y };
  }

  /**
   * Main draw function
   */
  function draw(
    points: Point[],
    curves: Curve[],
    sortedCurves: Curve[],
    bestCurve: Curve | null,
    getCurveColor: (rankIndex: number) => string,
    getDotColor: () => string
  ): void {
    const canvas: HTMLCanvasElement | null = canvasRef.value;
    if (canvas === null) return;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx === null) return;

    // Scale context for high-resolution rendering
    ctx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);

    // Clear canvas
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_SIZE.value, CANVAS_SIZE.value);

    // Draw grid
    drawGrid(ctx);

    // Draw axes
    drawAxes(ctx);

    // Draw curves
    drawCurves(ctx, sortedCurves, getCurveColor);

    ctx.globalAlpha = 1.0;

    // Draw error bars
    drawErrorBars(ctx, points, bestCurve);

    // Draw points
    drawPoints(ctx, points, getDotColor);

    // Draw labels
    drawLabels(ctx);

    // Draw fitness
    drawFitness(ctx, bestCurve, getDotColor);
  }

  /**
   * Draw grid lines
   */
  function drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = GRID_LINE_WIDTH;
    for (let i: number = 0; i <= 10; i++) {
      const pos: number = PADDING + (i / 10) * (CANVAS_SIZE.value - 2 * PADDING);

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, CANVAS_SIZE.value - PADDING);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(CANVAS_SIZE.value - PADDING, pos);
      ctx.stroke();
    }
  }

  /**
   * Draw coordinate axes
   */
  function drawAxes(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = COLOR_AXES;
    ctx.lineWidth = AXIS_LINE_WIDTH;

    // X-axis
    ctx.beginPath();
    const originCoords: CanvasCoords = toCanvasCoords(0, 0);
    ctx.moveTo(PADDING, originCoords.cy);
    ctx.lineTo(CANVAS_SIZE.value - PADDING, originCoords.cy);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originCoords.cx, PADDING);
    ctx.lineTo(originCoords.cx, CANVAS_SIZE.value - PADDING);
    ctx.stroke();
  }

  /**
   * Draw polynomial curves
   */
  function drawCurves(
    ctx: CanvasRenderingContext2D,
    sortedCurves: Curve[],
    getCurveColor: (rankIndex: number) => string
  ): void {
    sortedCurves
      .slice()
      .reverse()
      .forEach((curve: Curve, index: number): void => {
        const rankIndex: number = sortedCurves.length - 1 - index;
        ctx.strokeStyle = getCurveColor(rankIndex);
        ctx.lineWidth = rankIndex === 0 ? BEST_CURVE_LINE_WIDTH : OTHER_CURVE_LINE_WIDTH;
        ctx.globalAlpha = rankIndex === 0 ? 1.0 : OTHER_CURVE_OPACITY;
        ctx.beginPath();

        // Extend drawing range horizontally beyond visible area
        const drawMin: number = COORD_MIN - CURVE_HORIZONTAL_OVERDRAW;
        const drawMax: number = COORD_MAX + CURVE_HORIZONTAL_OVERDRAW;
        const range: number = drawMax - drawMin;

        for (let i: number = 0; i <= CURVE_RESOLUTION; i++) {
          const x: number = drawMin + (i / CURVE_RESOLUTION) * range;
          const y: number = evaluateCurve(curve, x);
          const coords: CanvasCoords = toCanvasCoords(x, y);

          if (i === 0) {
            ctx.moveTo(coords.cx, coords.cy);
          } else {
            ctx.lineTo(coords.cx, coords.cy);
          }
        }
        ctx.stroke();
      });
  }

  /**
   * Draw error bars from points to best curve
   */
  function drawErrorBars(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    bestCurve: Curve | null
  ): void {
    if (bestCurve === null) return;

    ctx.strokeStyle = COLOR_ERROR_BARS;
    ctx.lineWidth = ERROR_BAR_LINE_WIDTH;

    points.forEach((point: Point): void => {
      const pointCoords: CanvasCoords = toCanvasCoords(point.x, point.y);
      const predictedY: number = evaluateCurve(bestCurve, point.x);
      const curveCoords: CanvasCoords = toCanvasCoords(point.x, predictedY);

      ctx.beginPath();
      ctx.moveTo(pointCoords.cx, pointCoords.cy);
      ctx.lineTo(curveCoords.cx, curveCoords.cy);
      ctx.stroke();
    });
  }

  /**
   * Draw data points
   */
  function drawPoints(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    getDotColor: () => string
  ): void {
    points.forEach((point: Point): void => {
      const coords: CanvasCoords = toCanvasCoords(point.x, point.y);

      ctx.fillStyle = getDotColor();
      ctx.beginPath();
      ctx.arc(coords.cx, coords.cy, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = COLOR_POINT_BORDER;
      ctx.lineWidth = DOT_BORDER_WIDTH;
      ctx.stroke();
    });
  }

  /**
   * Draw axis labels
   */
  function drawLabels(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLOR_LABELS;
    ctx.font = '12px monospace';
    const center: number = PADDING + (CANVAS_SIZE.value - 2 * PADDING) / 2;

    // X-axis labels
    ctx.fillText(COORD_MIN.toString(), PADDING - 15, CANVAS_SIZE.value - PADDING + 15);
    ctx.fillText('0', center - 5, CANVAS_SIZE.value - PADDING + 15);
    ctx.fillText(COORD_MAX.toString(), CANVAS_SIZE.value - PADDING - 5, CANVAS_SIZE.value - PADDING + 15);

    // Y-axis labels
    ctx.fillText(COORD_MIN.toString(), PADDING - 20, CANVAS_SIZE.value - PADDING + 5);
    ctx.fillText('0', PADDING - 15, center + 5);
    ctx.fillText(COORD_MAX.toString(), PADDING - 15, PADDING + 5);
  }

  /**
   * Draw fitness display
   */
  function drawFitness(
    ctx: CanvasRenderingContext2D,
    bestCurve: Curve | null,
    getDotColor: () => string
  ): void {
    if (bestCurve === null) return;

    const fitnessText: string = `Fitness: ${formatScientific(bestCurve.fitness, 2)}`;
    ctx.font = '14px monospace';
    ctx.fillStyle = getDotColor();
    ctx.textAlign = 'right';
    ctx.fillText(fitnessText, CANVAS_SIZE.value - PADDING - 5, PADDING + 15);
    ctx.textAlign = 'left'; // Reset to default
  }

  return {
    CANVAS_SIZE,
    calculateCanvasSize,
    toCanvasCoords,
    fromCanvasCoords,
    draw,
  };
}
