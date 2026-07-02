import { describe, expect, it } from 'vitest'
import { buildExportPayload } from './lib/exportPayload'
import { DEFAULT_TURNKEY_PARAMS } from './lib/defaults'
import { turnkeyLockingEquation } from './lib/turnkeyDiagram'
import type { Metrics, TurnkeySnapshot } from './types'

describe('export payload', () => {
  it('includes complete Turnkey state-diagram data', () => {
    const snapshot: TurnkeySnapshot = {
      modelId: 'turnkey',
      step: 12,
      t: 0.006,
      primaryIntensity: new Float32Array([0.9, 1.1, 1.0]),
      backwardIntensity: new Float32Array([0.01, 0.01, 0.01]),
      primarySpectrumDb: new Float32Array([-120, 0, -120]),
      backwardSpectrumDb: new Float32Array([-180, -60, -180]),
      primaryHistoryRow: new Float32Array([-1, 0, -1]),
      backwardHistoryRow: new Float32Array([-80, -80, -80]),
      primaryEnergy: 0.9954,
      backwardEnergy: 0.01,
      primaryPeak: 1.1,
      backwardPeak: 0.01,
      lockedDetuning: 2.674,
      normalizedParams: DEFAULT_TURNKEY_PARAMS,
    }
    const metrics: Metrics = {
      stepsPerSecond: 1,
      snapshotRate: 1,
      memoryMb: 1,
      batchMs: 1,
      latencyMs: 1,
      loadPercent: 1,
      n: 512,
    }
    const payload = buildExportPayload(
      {
        modelId: 'turnkey',
        n: 512,
        params: DEFAULT_TURNKEY_PARAMS,
        psiP_real: [1, 0, 0],
        psiP_imag: [0, 0, 0],
        rhoB_real: 0.1,
        rhoB_imag: 0,
      },
      {
        modelId: 'turnkey',
        modelLabel: 'Turnkey soliton (self-injection locking)',
        snapshot,
        trace: [{ step: 12, primaryEnergy: snapshot.primaryEnergy, backwardEnergy: 0.01 }],
        historyRows: {
          standard: [],
          primary: [snapshot.primaryHistoryRow],
          stokes: [],
          backward: [snapshot.backwardHistoryRow],
          signal: [],
          idler: [],
        },
        metrics,
      },
    ) as {
      plots: {
        stateDiagram: {
          state: { x: number; y: number }
          lockingEquilibrium: Array<{ x: number; y: number }>
          kerrTilt: Array<{ x: number; y: number }>
        }
      }
    }

    expect(payload.plots.stateDiagram.state).toEqual({
      x: snapshot.lockedDetuning,
      y: snapshot.primaryEnergy,
    })
    expect(payload.plots.stateDiagram.kerrTilt.length).toBeGreaterThan(20)
    expect(payload.plots.stateDiagram.lockingEquilibrium.length).toBeGreaterThan(20)
    const point = payload.plots.stateDiagram.lockingEquilibrium[20]
    expect(Math.abs(turnkeyLockingEquation(
      point.x,
      point.y,
      DEFAULT_TURNKEY_PARAMS,
    ))).toBeLessThan(1e-5)
  })
})
