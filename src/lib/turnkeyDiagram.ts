import type { TurnkeyParams } from '../types'

export interface ChartPoint {
  x: number
  y: number
}

export interface TurnkeyStateDiagramData {
  state: ChartPoint
  kerrTilt: ChartPoint[]
  lockingEquilibrium: ChartPoint[]
  xRange: [number, number]
  yRange: [number, number]
}

export function buildKerrTilt(pump: number, yMax: number) {
  const pumpSquared = Math.max(pump * pump, 1e-6)
  const rhoMin = Math.max(0.04, pumpSquared * 0.05)
  const rhoMax = Math.min(pumpSquared, yMax)
  const lowerBranch: ChartPoint[] = []
  const upperBranch: ChartPoint[] = []
  const sampleCount = 180

  for (let index = 0; index <= sampleCount; index += 1) {
    const rho = rhoMin + ((rhoMax - rhoMin) * index) / sampleCount
    const rootArg = pumpSquared / rho - 1
    if (rootArg < 0) {
      continue
    }
    const root = Math.sqrt(rootArg)
    lowerBranch.push({ x: rho - root, y: rho })
    upperBranch.push({ x: rho + root, y: rho })
  }

  return [...lowerBranch, ...upperBranch.reverse()]
}

export function buildTurnkeyStateDiagramData(
  params: TurnkeyParams,
  lockedDetuning: number,
  intracavityPower: number,
) {
  const pumpSquared = Math.max(params.pump * params.pump, 1e-6)
  const yMin = 0
  const yMax = Math.max(0.8, pumpSquared * 1.18, intracavityPower * 1.35)
  const state = { x: lockedDetuning, y: intracavityPower }
  const kerrTilt = buildKerrTilt(params.pump, yMax)
  const lockingEquilibrium = buildTurnkeyLockingEquilibrium(
    params,
    yMin,
    yMax,
    state,
  )
  const xCandidates = [
    0,
    state.x,
    ...lockingEquilibrium.map((point) => point.x),
    ...kerrTilt.map((point) => point.x),
  ].filter((value) => Number.isFinite(value))
  const rawXMin = Math.min(...xCandidates)
  const rawXMax = Math.max(...xCandidates)
  const xPadding = Math.max(0.35, (rawXMax - rawXMin) * 0.08)

  return {
    state,
    kerrTilt,
    lockingEquilibrium,
    xRange: [rawXMin - xPadding, rawXMax + xPadding] as [number, number],
    yRange: [yMin, yMax] as [number, number],
  } satisfies TurnkeyStateDiagramData
}

export function buildTurnkeyLockingEquilibrium(
  params: TurnkeyParams,
  yMin: number,
  yMax: number,
  state: ChartPoint,
) {
  const sampleCount = 180
  const powers = Array.from(
    { length: sampleCount + 1 },
    (_, index) => yMin + ((yMax - yMin) * index) / sampleCount,
  )
  const nearestIndex = powers.reduce((bestIndex, power, index) =>
    Math.abs(power - state.y) < Math.abs(powers[bestIndex] - state.y)
      ? index
      : bestIndex,
  0)
  const points = new Array<ChartPoint>(powers.length)
  points[nearestIndex] = {
    x: solveTurnkeyLockingAlpha(params, powers[nearestIndex], state.x),
    y: powers[nearestIndex],
  }

  for (let index = nearestIndex + 1; index < powers.length; index += 1) {
    points[index] = {
      x: solveTurnkeyLockingAlpha(params, powers[index], points[index - 1].x),
      y: powers[index],
    }
  }
  for (let index = nearestIndex - 1; index >= 0; index -= 1) {
    points[index] = {
      x: solveTurnkeyLockingAlpha(params, powers[index], points[index + 1].x),
      y: powers[index],
    }
  }

  return points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
}

export function solveTurnkeyLockingAlpha(
  params: TurnkeyParams,
  power: number,
  initialAlpha: number,
) {
  if (params.lockingBandwidth <= 1e-12) {
    return params.laserDetuning
  }

  let alpha = clamp(initialAlpha, -50, 80)
  for (let iteration = 0; iteration < 12; iteration += 1) {
    const value = turnkeyLockingEquation(alpha, power, params)
    if (Math.abs(value) < 1e-8) {
      break
    }
    const eps = 1e-4 * Math.max(1, Math.abs(alpha))
    const slope = (
      turnkeyLockingEquation(alpha + eps, power, params)
      - turnkeyLockingEquation(alpha - eps, power, params)
    ) / (2 * eps)
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-8) {
      break
    }
    alpha = clamp(alpha - clamp(value / slope, -2, 2), -50, 80)
  }
  return alpha
}

export function turnkeyLockingEquation(alpha: number, power: number, params: TurnkeyParams) {
  return alpha - params.laserDetuning - params.lockingBandwidth * turnkeyLockingResponse(
    power,
    alpha,
    params.feedbackPhase,
  )
}

export function turnkeyLockingResponse(power: number, alpha: number, phase: number) {
  const denominator = (
    (1 + (alpha - power) ** 2)
    * (1 + (alpha - 2 * power) ** 2)
  )
  if (denominator <= 0) {
    return 0
  }
  const numerator = (
    (3 * power - 2 * alpha) * Math.cos(phase)
    + (1 - 2 * power ** 2 + 3 * power * alpha - alpha ** 2) * Math.sin(phase)
  )
  return numerator / denominator
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
