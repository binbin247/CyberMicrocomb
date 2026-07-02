import type { GridSize, StandardParams, StokesParams } from '../types'

export const GRID_SIZES: GridSize[] = [256, 512, 1024, 2048, 4096]

export const DEFAULT_GRID_SIZE: GridSize = 512

export const DEFAULT_STANDARD_PARAMS: StandardParams = {
  alpha: -5,
  pump: 3.94,
  d2: -0.0444,
  d3: 0,
  d4: 0,
  tauR: 0,
  dt: 0.0008,
  stepsPerFrame: 50,
}

export const DEFAULT_STOKES_PARAMS: StokesParams = {
  alphaP: 40,
  alphaS: 0,
  pump: 10,
  d2P: 0.02,
  d2S: 0.02,
  fsrMismatch: 0,
  overlap: 0.8,
  fR: 0.18,
  ramanGainP: 0.2,
  ramanGainS: 0.2,
  wavelengthRatio: 1,
  tauR: 0.00033,
  noise: 0.00001,
  dt: 0.00005,
  stepsPerFrame: 50,
}
