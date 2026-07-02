import type {
  Metrics,
  ModelId,
  MulticolorSnapshot,
  PlaticonSnapshot,
  RamanSnapshot,
  Snapshot,
  StandardSnapshot,
  StokesSnapshot,
  TurnkeySnapshot,
} from '../types'
import { buildTurnkeyStateDiagramData } from './turnkeyDiagram'

const HISTORY_LIMIT = 300
const TEMPORAL_X_TITLE = 'Azimuthal coordinate φ'
const SPECTRUM_X_TITLE = 'Mode number μ'
const TEMPORAL_Y_LABEL = 'Field intensity |ψ|^2'

export interface TracePoint {
  step: number
  energy?: number
  primaryEnergy?: number
  stokesEnergy?: number
  backwardEnergy?: number
  signalEnergy?: number
  idlerEnergy?: number
  pulseWidthFs?: number
  selfFrequencyShiftThz?: number
}

export interface ModelHistoryRows {
  standard: Float32Array[]
  primary: Float32Array[]
  stokes: Float32Array[]
  backward: Float32Array[]
  signal: Float32Array[]
  idler: Float32Array[]
}

export interface ExportPlotSource {
  modelId: ModelId
  modelLabel: string
  snapshot: Snapshot | null
  trace: TracePoint[]
  historyRows: ModelHistoryRows
  metrics: Metrics | null
}

export function buildExportPayload(solverState: unknown, source: ExportPlotSource) {
  const snapshot = source.snapshot
  const solverStateObject = isObjectRecord(solverState) ? solverState : { solverState }
  const base = {
    ...solverStateObject,
    exportSchemaVersion: 3,
    exportedAt: new Date().toISOString(),
    modelId: source.modelId,
    modelLabel: source.modelLabel,
    metrics: source.metrics,
  }

  if (isStokesSnapshot(snapshot)) {
    const primaryRows = source.historyRows.primary.map((row) => Array.from(row))
    const stokesRows = source.historyRows.stokes.map((row) => Array.from(row))
    const primaryEnergy = source.trace.map((item) => item.primaryEnergy ?? 0)
    const stokesEnergy = source.trace.map((item) => item.stokesEnergy ?? 0)
    return {
      ...base,
      fields: {
        psiP_real: asNumberArray(solverStateObject.psiP_real),
        psiP_imag: asNumberArray(solverStateObject.psiP_imag),
        psiS_real: asNumberArray(solverStateObject.psiS_real),
        psiS_imag: asNumberArray(solverStateObject.psiS_imag),
      },
      currentSnapshot: {
        step: snapshot.step,
        t: snapshot.t,
        primaryEnergy: snapshot.primaryEnergy,
        stokesEnergy: snapshot.stokesEnergy,
        primaryPeak: snapshot.primaryPeak,
        stokesPeak: snapshot.stokesPeak,
        normalizedParams: snapshot.normalizedParams,
      },
      plots: {
        temporalField: {
          x: thetaArray(snapshot.primaryIntensity.length),
          primaryIntensity: Array.from(snapshot.primaryIntensity),
          stokesIntensity: Array.from(snapshot.stokesIntensity),
          xLabel: TEMPORAL_X_TITLE,
          yLabel: TEMPORAL_Y_LABEL,
        },
        combSpectrum: {
          mode: centeredModeArray(snapshot.primarySpectrumDb.length),
          primarySpectrumDb: Array.from(snapshot.primarySpectrumDb),
          stokesSpectrumDb: Array.from(snapshot.stokesSpectrumDb),
          xLabel: SPECTRUM_X_TITLE,
          yLabel: 'Spectrum (dB)',
        },
        intracavityEnergy: {
          step: source.trace.map((item) => item.step),
          primary: primaryEnergy,
          stokes: stokesEnergy,
          primaryEnergy,
          stokesEnergy,
          xLabel: 'solver step',
          yLabel: 'Energy',
        },
        temporalEvolution: {
          primaryRows,
          stokesRows,
          rowCount: Math.max(primaryRows.length, stokesRows.length),
          columnCount: primaryRows[0]?.length ?? stokesRows[0]?.length ?? 0,
          valueLabel: '10 * log10(|psi|^2 + 1e-12)',
          maxRows: HISTORY_LIMIT,
        },
      },
    }
  }

  if (isTurnkeySnapshot(snapshot)) {
    const primaryRows = source.historyRows.primary.map((row) => Array.from(row))
    const backwardRows = source.historyRows.backward.map((row) => Array.from(row))
    const primaryEnergy = source.trace.map((item) => item.primaryEnergy ?? 0)
    const backwardEnergy = source.trace.map((item) => item.backwardEnergy ?? 0)
    const stateDiagram = buildTurnkeyStateDiagramData(
      snapshot.normalizedParams,
      snapshot.lockedDetuning,
      snapshot.primaryEnergy,
    )
    return {
      ...base,
      fields: {
        psiP_real: asNumberArray(solverStateObject.psiP_real),
        psiP_imag: asNumberArray(solverStateObject.psiP_imag),
        rhoB_real: typeof solverStateObject.rhoB_real === 'number'
          ? solverStateObject.rhoB_real
          : 0,
        rhoB_imag: typeof solverStateObject.rhoB_imag === 'number'
          ? solverStateObject.rhoB_imag
          : 0,
      },
      currentSnapshot: {
        step: snapshot.step,
        t: snapshot.t,
        primaryEnergy: snapshot.primaryEnergy,
        backwardEnergy: snapshot.backwardEnergy,
        primaryPeak: snapshot.primaryPeak,
        backwardPeak: snapshot.backwardPeak,
        lockedDetuning: snapshot.lockedDetuning,
        normalizedParams: snapshot.normalizedParams,
      },
      plots: {
        temporalField: {
          x: thetaArray(snapshot.primaryIntensity.length),
          primaryIntensity: Array.from(snapshot.primaryIntensity),
          backwardIntensity: Array.from(snapshot.backwardIntensity),
          xLabel: TEMPORAL_X_TITLE,
          yLabel: TEMPORAL_Y_LABEL,
        },
        combSpectrum: {
          mode: centeredModeArray(snapshot.primarySpectrumDb.length),
          primarySpectrumDb: Array.from(snapshot.primarySpectrumDb),
          backwardSpectrumDb: Array.from(snapshot.backwardSpectrumDb),
          xLabel: SPECTRUM_X_TITLE,
          yLabel: 'Spectrum (dB)',
        },
        intracavityEnergy: {
          step: source.trace.map((item) => item.step),
          primary: primaryEnergy,
          backward: backwardEnergy,
          xLabel: 'solver step',
          yLabel: 'Energy',
        },
        temporalEvolution: {
          primaryRows,
          backwardRows,
          rowCount: Math.max(primaryRows.length, backwardRows.length),
          columnCount: primaryRows[0]?.length ?? backwardRows[0]?.length ?? 0,
          valueLabel: '10 * log10(|psi|^2 + 1e-12)',
          maxRows: HISTORY_LIMIT,
        },
        stateDiagram: {
          state: stateDiagram.state,
          kerrTilt: stateDiagram.kerrTilt,
          lockingEquilibrium: stateDiagram.lockingEquilibrium,
          xRange: stateDiagram.xRange,
          yRange: stateDiagram.yRange,
          xLabel: 'Normalized detuning alpha = 2 delta omega / kappa',
          yLabel: 'Normalized intracavity power',
        },
      },
    }
  }

  if (isMulticolorSnapshot(snapshot)) {
    const primaryRows = source.historyRows.primary.map((row) => Array.from(row))
    const signalRows = source.historyRows.signal.map((row) => Array.from(row))
    const idlerRows = source.historyRows.idler.map((row) => Array.from(row))
    const primaryEnergy = source.trace.map((item) => item.primaryEnergy ?? 0)
    const signalEnergy = source.trace.map((item) => item.signalEnergy ?? 0)
    const idlerEnergy = source.trace.map((item) => item.idlerEnergy ?? 0)
    return {
      ...base,
      fields: {
        psiP_real: asNumberArray(solverStateObject.psiP_real),
        psiP_imag: asNumberArray(solverStateObject.psiP_imag),
        psiS_real: asNumberArray(solverStateObject.psiS_real),
        psiS_imag: asNumberArray(solverStateObject.psiS_imag),
        psiI_real: asNumberArray(solverStateObject.psiI_real),
        psiI_imag: asNumberArray(solverStateObject.psiI_imag),
      },
      currentSnapshot: {
        step: snapshot.step,
        t: snapshot.t,
        primaryEnergy: snapshot.primaryEnergy,
        signalEnergy: snapshot.signalEnergy,
        idlerEnergy: snapshot.idlerEnergy,
        primaryPeak: snapshot.primaryPeak,
        signalPeak: snapshot.signalPeak,
        idlerPeak: snapshot.idlerPeak,
        normalizedParams: snapshot.normalizedParams,
      },
      plots: {
        temporalField: {
          x: thetaArray(snapshot.primaryIntensity.length),
          primaryIntensity: Array.from(snapshot.primaryIntensity),
          signalIntensity: Array.from(snapshot.signalIntensity),
          idlerIntensity: Array.from(snapshot.idlerIntensity),
          xLabel: TEMPORAL_X_TITLE,
          yLabel: TEMPORAL_Y_LABEL,
        },
        combSpectrum: {
          mode: centeredModeArray(snapshot.primarySpectrumDb.length),
          primarySpectrumDb: Array.from(snapshot.primarySpectrumDb),
          signalSpectrumDb: Array.from(snapshot.signalSpectrumDb),
          idlerSpectrumDb: Array.from(snapshot.idlerSpectrumDb),
          xLabel: SPECTRUM_X_TITLE,
          yLabel: 'Spectrum (dB)',
        },
        intracavityEnergy: {
          step: source.trace.map((item) => item.step),
          primary: primaryEnergy,
          signal: signalEnergy,
          idler: idlerEnergy,
          xLabel: 'solver step',
          yLabel: 'Energy',
        },
        temporalEvolution: {
          primaryRows,
          signalRows,
          idlerRows,
          rowCount: Math.max(primaryRows.length, signalRows.length, idlerRows.length),
          columnCount:
            primaryRows[0]?.length ?? signalRows[0]?.length ?? idlerRows[0]?.length ?? 0,
          valueLabel: '10 * log10(|psi|^2 + 1e-12)',
          maxRows: HISTORY_LIMIT,
        },
      },
    }
  }

  if (isSingleFieldSnapshot(snapshot)) {
    const waterfallRows = source.historyRows.standard.map((row) => Array.from(row))
    return {
      ...base,
      fields: {
        psi_real: asNumberArray(solverStateObject.psi_real),
        psi_imag: asNumberArray(solverStateObject.psi_imag),
      },
      currentSnapshot: {
        step: snapshot.step,
        t: snapshot.t,
        energy: snapshot.energy,
        peak: snapshot.peak,
        pulseWidthFs: isRamanSnapshot(snapshot) ? snapshot.pulseWidthFs : undefined,
        selfFrequencyShiftThz: isRamanSnapshot(snapshot)
          ? snapshot.selfFrequencyShiftThz
          : undefined,
        selfFrequencyShiftMu: isRamanSnapshot(snapshot)
          ? snapshot.selfFrequencyShiftMu
          : undefined,
        normalizedParams: snapshot.normalizedParams,
        referenceParams: isRamanSnapshot(snapshot) ? snapshot.referenceParams : undefined,
      },
      plots: {
        temporalField: {
          x: thetaArray(snapshot.intensity.length),
          intensity: Array.from(snapshot.intensity),
          xLabel: TEMPORAL_X_TITLE,
          yLabel: TEMPORAL_Y_LABEL,
        },
        combSpectrum: {
          mode: centeredModeArray(snapshot.spectrumDb.length),
          spectrumDb: Array.from(snapshot.spectrumDb),
          xLabel: SPECTRUM_X_TITLE,
          yLabel: 'Spectrum (dB)',
        },
        intracavityEnergy: {
          step: source.trace.map((item) => item.step),
          energy: source.trace.map((item) => item.energy ?? 0),
          xLabel: 'solver step',
          yLabel: 'Energy',
        },
        temporalEvolution: {
          rows: waterfallRows,
          rowCount: waterfallRows.length,
          columnCount: waterfallRows[0]?.length ?? 0,
          valueLabel: '10 * log10(|psi|^2 + 1e-12)',
          maxRows: HISTORY_LIMIT,
        },
        diagnostics: isRamanSnapshot(snapshot)
          ? {
              step: source.trace.map((item) => item.step),
              pulseWidthFs: source.trace.map((item) => item.pulseWidthFs ?? 0),
              selfFrequencyShiftThz: source.trace.map(
                (item) => item.selfFrequencyShiftThz ?? 0,
              ),
            }
          : undefined,
      },
    }
  }

  return { ...base, currentSnapshot: null, plots: null }
}

function thetaArray(length: number) {
  return Array.from(
    { length },
    (_, index) => -Math.PI + (2 * Math.PI * index) / length,
  )
}

function centeredModeArray(length: number) {
  const half = Math.floor(length / 2)
  return Array.from({ length }, (_, index) => index - half)
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asNumberArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'number') : []
}

function isStokesSnapshot(snapshot: Snapshot | null): snapshot is StokesSnapshot {
  return snapshot?.modelId === 'stokes'
}

function isTurnkeySnapshot(snapshot: Snapshot | null): snapshot is TurnkeySnapshot {
  return snapshot?.modelId === 'turnkey'
}

function isMulticolorSnapshot(snapshot: Snapshot | null): snapshot is MulticolorSnapshot {
  return snapshot?.modelId === 'multicolor'
}

function isRamanSnapshot(snapshot: Snapshot | null): snapshot is RamanSnapshot {
  return snapshot?.modelId === 'raman'
}

function isSingleFieldSnapshot(
  snapshot: Snapshot | null,
): snapshot is StandardSnapshot | PlaticonSnapshot | RamanSnapshot {
  return (
    snapshot?.modelId === 'standard' ||
    snapshot?.modelId === 'platicon' ||
    snapshot?.modelId === 'raman'
  )
}
