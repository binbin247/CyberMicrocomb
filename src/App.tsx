import {
  Activity,
  BookOpen,
  Download,
  Languages,
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { ModelDocsPanel } from './components/ModelDocsPanel'
import { PlotPanel } from './components/PlotPanel'
import { WaterfallCanvas } from './components/WaterfallCanvas'
import {
  DEFAULT_GRID_BY_MODEL,
  DEFAULT_MULTICOLOR_PARAMS,
  DEFAULT_PLATICON_PARAMS,
  DEFAULT_RAMAN_PARAMS,
  DEFAULT_STANDARD_PARAMS,
  DEFAULT_STOKES_PARAMS,
  defaultParamsForModel,
  DEFAULT_TURNKEY_PARAMS,
  GRID_SIZES,
} from './lib/defaults'
import { t } from './lib/i18n'
import { MODEL_IDS } from './lib/models'
import { clampParamsForModel, clampPlaticonParams, modeShiftBounds } from './lib/physics'
import type {
  GridSize,
  Language,
  Metrics,
  ModelId,
  MulticolorParams,
  MulticolorSnapshot,
  PlaticonParams,
  PlaticonSnapshot,
  RamanParams,
  RamanSnapshot,
  SimulationParams,
  Snapshot,
  StandardParams,
  StandardSnapshot,
  StokesParams,
  StokesSnapshot,
  TurnkeyParams,
  TurnkeySnapshot,
  WorkerStatus,
  WorkerToMainMessage,
} from './types'

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full'
const BUSUANZI_URL = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
const HISTORY_LIMIT = 300
const ENERGY_MIN_Y_SPAN = 0.05

interface PendingDefaultReset {
  modelId: ModelId
  gridSize: GridSize
  params: SimulationParams
}
const THETA_RANGE: [number, number] = [-Math.PI, Math.PI]
const THETA_TICK_VALUES = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI]
const THETA_TICK_LABELS = ['-pi', '-pi/2', '0', 'pi/2', 'pi']
const TEMPORAL_X_TITLE = 'Azimuthal coordinate φ'
const SPECTRUM_X_TITLE = 'Mode number μ'
const TEMPORAL_Y_TITLE = 'Field intensity |ψ|<sup>2</sup>'
const TEMPORAL_Y_LABEL = 'Field intensity |ψ|^2'
const TURNKEY_LOCKING_SLOPE = 1.5

interface TracePoint {
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

interface ModelHistoryRows {
  standard: Float32Array[]
  primary: Float32Array[]
  stokes: Float32Array[]
  backward: Float32Array[]
  signal: Float32Array[]
  idler: Float32Array[]
}

interface ExportPlotSource {
  modelId: ModelId
  modelLabel: string
  snapshot: Snapshot | null
  trace: TracePoint[]
  historyRows: ModelHistoryRows
  metrics: Metrics | null
}

interface ControlDefinition {
  key: string
  min: number
  max: number
  step: number
}

interface ControlGroupDefinition {
  titleKey?: string
  controls: readonly ControlDefinition[]
}

interface ChartPoint {
  x: number
  y: number
}

const standardControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'drive',
    controls: [
      { key: 'alpha', min: -12, max: 20, step: 0.01 },
      { key: 'pump', min: 0, max: 8, step: 0.01 },
    ],
  },
  {
    titleKey: 'dispersion',
    controls: [
      { key: 'd2', min: -0.25, max: 0.25, step: 0.0001 },
      { key: 'd3', min: -0.05, max: 0.05, step: 0.0001 },
      { key: 'd4', min: -0.01, max: 0.01, step: 0.00001 },
    ],
  },
  {
    titleKey: 'nonlinearRaman',
    controls: [
      { key: 'tauR', min: 0, max: 0.2, step: 0.0001 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 250, step: 1 },
    ],
  },
]

const platiconControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'drive',
    controls: [
      { key: 'alpha', min: -20, max: 40, step: 0.01 },
      { key: 'pump', min: 0, max: 12, step: 0.01 },
    ],
  },
  {
    titleKey: 'dispersion',
    controls: [
      { key: 'd2', min: -0.25, max: 0.25, step: 0.0001 },
    ],
  },
  {
    titleKey: 'modePerturbation',
    controls: [
      { key: 'modeShiftMu', min: -256, max: 255, step: 1 },
      { key: 'modeShiftStrength', min: -20, max: 20, step: 0.01 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 250, step: 1 },
    ],
  },
]

const stokesControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'primary',
    controls: [
      { key: 'alphaP', min: -20, max: 100, step: 0.01 },
      { key: 'pump', min: 0, max: 40, step: 0.01 },
      { key: 'd2P', min: -0.25, max: 0.25, step: 0.0001 },
    ],
  },
  {
    titleKey: 'stokes',
    controls: [
      { key: 'd2S', min: -0.25, max: 0.25, step: 0.0001 },
      { key: 'fsrMismatch', min: -1, max: 1, step: 0.0001 },
    ],
  },
  {
    titleKey: 'coupling',
    controls: [
      { key: 'overlap', min: 0, max: 2, step: 0.01 },
      { key: 'fR', min: 0, max: 1, step: 0.01 },
      { key: 'ramanGainP', min: 0, max: 2, step: 0.001 },
      { key: 'ramanGainS', min: 0, max: 2, step: 0.001 },
      { key: 'wavelengthRatio', min: 0.5, max: 1.5, step: 0.001 },
      { key: 'tauR', min: 0, max: 0.02, step: 0.00001 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'noise', min: 0, max: 0.001, step: 0.000001 },
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 10000, step: 1 },
    ],
  },
]

const turnkeyControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'drive',
    controls: [
      { key: 'laserDetuning', min: -20, max: 40, step: 0.01 },
      { key: 'pump', min: 0, max: 8, step: 0.01 },
    ],
  },
  {
    titleKey: 'dispersion',
    controls: [
      { key: 'd2', min: -0.25, max: 0.25, step: 0.0001 },
    ],
  },
  {
    titleKey: 'selfInjection',
    controls: [
      { key: 'beta', min: 0, max: 3, step: 0.01 },
      { key: 'lockingBandwidth', min: 0, max: 40, step: 0.01 },
      { key: 'feedbackPhase', min: -Math.PI, max: Math.PI, step: 0.001 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'noise', min: 0, max: 0.001, step: 0.000001 },
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 5000, step: 1 },
    ],
  },
]

const multicolorControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'primary',
    controls: [
      { key: 'alphaP', min: -20, max: 100, step: 0.01 },
      { key: 'pump', min: 0, max: 40, step: 0.01 },
      { key: 'd2P', min: -1, max: 1, step: 0.0001 },
    ],
  },
  {
    titleKey: 'signal',
    controls: [
      { key: 'alphaS', min: -20, max: 100, step: 0.01 },
      { key: 'd2S', min: -1, max: 1, step: 0.0001 },
      { key: 'fsrMismatchS', min: -40, max: 40, step: 0.001 },
    ],
  },
  {
    titleKey: 'idler',
    controls: [
      { key: 'alphaI', min: -20, max: 100, step: 0.01 },
      { key: 'd2I', min: -1, max: 1, step: 0.0001 },
      { key: 'fsrMismatchI', min: -40, max: 40, step: 0.001 },
    ],
  },
  {
    titleKey: 'fwm',
    controls: [
      { key: 'xpm', min: 0, max: 4, step: 0.001 },
      { key: 'fwmRe', min: -4, max: 4, step: 0.001 },
      { key: 'fwmIm', min: -4, max: 4, step: 0.001 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'noise', min: 0, max: 0.001, step: 0.000001 },
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 10000, step: 1 },
    ],
  },
]

const ramanControlGroups: readonly ControlGroupDefinition[] = [
  {
    titleKey: 'drive',
    controls: [
      { key: 'dtnNorm', min: 0.1, max: 80, step: 0.01 },
      { key: 'ffNorm', min: 0, max: 150, step: 0.01 },
    ],
  },
  {
    titleKey: 'dispersion',
    controls: [
      { key: 'd2Norm', min: 0.001, max: 8, step: 0.0001 },
    ],
  },
  {
    titleKey: 'ramanResponse',
    controls: [
      { key: 'fR', min: 0, max: 1, step: 0.001 },
      { key: 'tau1Fs', min: 0.1, max: 200, step: 0.1 },
      { key: 'tau2Fs', min: 0.1, max: 1000, step: 0.1 },
      { key: 'fsrGHz', min: 10, max: 3000, step: 1 },
      { key: 'qMillion', min: 0.1, max: 100, step: 0.1 },
      { key: 'wavelengthNm', min: 1000, max: 2500, step: 1 },
    ],
  },
  {
    titleKey: 'numerics',
    controls: [
      { key: 'noise', min: 0, max: 0.001, step: 0.000001 },
      { key: 'dt', min: 1e-12, max: 0.005, step: 0.000001 },
      { key: 'stepsPerFrame', min: 1, max: 10000, step: 1 },
    ],
  },
]

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const labels = t(language)
  const [modelId, setModelId] = useState<ModelId>('standard')
  const [gridSizesByModel, setGridSizesByModel] =
    useState<Record<ModelId, GridSize>>(DEFAULT_GRID_BY_MODEL)
  const [standardParams, setStandardParams] = useState(DEFAULT_STANDARD_PARAMS)
  const [platiconParams, setPlaticonParams] = useState(DEFAULT_PLATICON_PARAMS)
  const [stokesParams, setStokesParams] = useState(DEFAULT_STOKES_PARAMS)
  const [turnkeyParams, setTurnkeyParams] = useState(DEFAULT_TURNKEY_PARAMS)
  const [multicolorParams, setMulticolorParams] = useState(DEFAULT_MULTICOLOR_PARAMS)
  const [ramanParams, setRamanParams] = useState(DEFAULT_RAMAN_PARAMS)
  const [status, setStatus] = useState<WorkerStatus>('idle')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [livePreview, setLivePreview] = useState(true)
  const [isDocsOpen, setIsDocsOpen] = useState(false)
  const [trace, setTrace] = useState<TracePoint[]>([])
  const [historyRows, setHistoryRows] = useState<ModelHistoryRows>(emptyHistoryRows)
  const workerRef = useRef<Worker | null>(null)
  const modelIdRef = useRef<ModelId>('standard')
  const modelLabelRef = useRef<string>(labels.modelLabels.standard)
  const snapshotRef = useRef<Snapshot | null>(null)
  const metricsRef = useRef<Metrics | null>(null)
  const traceRef = useRef<TracePoint[]>([])
  const historyRowsRef = useRef<ModelHistoryRows>(emptyHistoryRows())
  const lastGridRef = useRef<GridSize | null>(null)
  const lastModelRef = useRef<ModelId | null>(null)
  const didInitialConfigureRef = useRef(false)
  const livePreviewRef = useRef(true)
  const isRunningRef = useRef(false)
  const previewTimerRef = useRef<number | null>(null)
  const pendingDefaultResetRef = useRef<PendingDefaultReset | null>(null)
  const [resetToken, setResetToken] = useState(0)

  const gridSize = gridSizesByModel[modelId]

  const activeParams = useMemo(
    () => {
      if (modelId === 'stokes') {
        return clampParamsForModel('stokes', stokesParams) as StokesParams
      }
      if (modelId === 'platicon') {
        return clampPlaticonParams(platiconParams, gridSize)
      }
      if (modelId === 'turnkey') {
        return clampParamsForModel('turnkey', turnkeyParams) as TurnkeyParams
      }
      if (modelId === 'multicolor') {
        return clampParamsForModel('multicolor', multicolorParams) as MulticolorParams
      }
      if (modelId === 'raman') {
        return clampParamsForModel('raman', ramanParams) as RamanParams
      }
      return clampParamsForModel('standard', standardParams) as StandardParams
    },
    [
      gridSize,
      modelId,
      multicolorParams,
      platiconParams,
      ramanParams,
      standardParams,
      stokesParams,
      turnkeyParams,
    ],
  )

  const activeControlGroups = getControlGroups(modelId)
  const activeWaterfallCount = getWaterfallCount(modelId, historyRows)

  const intensityX = snapshot ? thetaArray(getFieldLength(snapshot)) : []
  const spectrumX = snapshot ? centeredModeArray(getSpectrumLength(snapshot)) : []
  const temporalSeries = getTemporalSeries(snapshot, labels)
  const spectrumSeries = getSpectrumSeries(snapshot, labels)
  const energySeries = getEnergySeries(modelId, trace, labels)
  const temporalHeaderStats = isRamanSnapshot(snapshot)
    ? [{ label: labels.pulseWidth, value: formatNumber(snapshot.pulseWidthFs) }]
    : undefined
  const spectrumHeaderStats = isRamanSnapshot(snapshot)
    ? [{ label: labels.selfFrequencyShift, value: formatNumber(snapshot.selfFrequencyShiftThz) }]
    : undefined

  const resetLocalBuffers = useCallback(() => {
    const emptyRows = emptyHistoryRows()
    setSnapshot(null)
    setTrace([])
    setHistoryRows(emptyRows)
    snapshotRef.current = null
    traceRef.current = []
    historyRowsRef.current = emptyRows
  }, [])

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    livePreviewRef.current = livePreview
  }, [livePreview])

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  useEffect(() => {
    modelIdRef.current = modelId
    modelLabelRef.current = labels.modelLabels[modelId]
  }, [labels.modelLabels, modelId])

  useEffect(() => {
    if (document.getElementById('busuanzi-script')) {
      return
    }
    const script = document.createElement('script')
    script.id = 'busuanzi-script'
    script.async = true
    script.src = BUSUANZI_URL
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('./worker/lle.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker
    setStatus('loading')
    setError(null)
    const solverUrl = new URL(
      `${import.meta.env.BASE_URL}lle_solver.py`,
      window.location.origin,
    ).href

    worker.onerror = (event) => {
      setError(event.message)
      setStatus('error')
      setIsRunning(false)
    }

    worker.onmessage = (event: MessageEvent<WorkerToMainMessage>) => {
      const message = event.data
      if (message.type === 'loading') {
        setLoadingMessage(message.message)
        setError(null)
        return
      }
      if (message.type === 'ready') {
        setIsReady(true)
        setStatus('ready')
        setError(null)
        return
      }
      if (message.type === 'snapshot') {
        const next = message.snapshot
        setError(null)
        setSnapshot(next)
        snapshotRef.current = next
        syncClampedDt(next, {
          standard: setStandardParams,
          platicon: setPlaticonParams,
          stokes: setStokesParams,
          turnkey: setTurnkeyParams,
          multicolor: setMulticolorParams,
          raman: setRamanParams,
        })
        setTrace((items) => {
          const clipped = [...items, tracePointFromSnapshot(next)].slice(-HISTORY_LIMIT)
          traceRef.current = clipped
          return clipped
        })
        setHistoryRows((rows) => {
          const clipped = appendHistoryRows(rows, next)
          historyRowsRef.current = clipped
          return clipped
        })
        return
      }
      if (message.type === 'metrics') {
        setMetrics(message.metrics)
        metricsRef.current = message.metrics
        return
      }
      if (message.type === 'exportState') {
        downloadJson(buildExportPayload(message.payload, {
          modelId: modelIdRef.current,
          modelLabel: modelLabelRef.current,
          snapshot: snapshotRef.current,
          trace: traceRef.current,
          historyRows: historyRowsRef.current,
          metrics: metricsRef.current,
        }))
        return
      }
      if (message.type === 'error') {
        setError(message.error)
        setStatus('error')
        setIsRunning(false)
      }
    }

    worker.postMessage({ type: 'init', pyodideUrl: PYODIDE_URL, solverUrl })

    return () => {
      clearPreviewTimer()
      worker.terminate()
      workerRef.current = null
    }
  }, [clearPreviewTimer])

  useEffect(() => {
    const worker = workerRef.current
    if (!worker || !isReady) {
      return
    }
    const pendingDefaultReset = pendingDefaultResetRef.current
    if (pendingDefaultReset && pendingDefaultReset.modelId === modelId) {
      resetLocalBuffers()
      worker.postMessage({
        type: 'configure',
        modelId: pendingDefaultReset.modelId,
        n: pendingDefaultReset.gridSize,
        params: pendingDefaultReset.params,
        reset: true,
      })
      lastGridRef.current = pendingDefaultReset.gridSize
      lastModelRef.current = pendingDefaultReset.modelId
      didInitialConfigureRef.current = true
      pendingDefaultResetRef.current = null
      return
    }
    const reset =
      lastGridRef.current !== gridSize ||
      lastModelRef.current !== modelId ||
      !didInitialConfigureRef.current
    if (reset) {
      resetLocalBuffers()
      worker.postMessage({
        type: 'configure',
        modelId,
        n: gridSize,
        params: activeParams,
        reset,
      })
      lastGridRef.current = gridSize
      lastModelRef.current = modelId
      didInitialConfigureRef.current = true
    } else {
      worker.postMessage({ type: 'updateParams', modelId, params: activeParams })
      if (livePreviewRef.current && !isRunningRef.current) {
        clearPreviewTimer()
        previewTimerRef.current = window.setTimeout(() => {
          previewTimerRef.current = null
          worker.postMessage({ type: 'step' })
          setStatus('paused')
        }, 35)
      }
    }
  }, [activeParams, clearPreviewTimer, gridSize, isReady, modelId, resetLocalBuffers, resetToken])

  const changeModel = (nextModelId: ModelId) => {
    if (nextModelId === modelId) {
      return
    }
    clearPreviewTimer()
    setIsRunning(false)
    setStatus(isReady ? 'ready' : 'loading')
    workerRef.current?.postMessage({ type: 'pause' })
    resetLocalBuffers()
    setModelId(nextModelId)
  }

  const start = () => {
    if (!isReady) {
      return
    }
    clearPreviewTimer()
    setError(null)
    setIsRunning(true)
    setStatus('running')
    workerRef.current?.postMessage({ type: 'start' })
  }

  const pause = () => {
    setIsRunning(false)
    setStatus('paused')
    workerRef.current?.postMessage({ type: 'pause' })
  }

  const step = () => {
    setIsRunning(false)
    setStatus('paused')
    workerRef.current?.postMessage({ type: 'step' })
  }

  const reset = () => {
    const defaultGrid = DEFAULT_GRID_BY_MODEL[modelId]
    const defaultParams = defaultParamsForModel(modelId)
    clearPreviewTimer()
    setIsRunning(false)
    setStatus(isReady ? 'ready' : 'loading')
    setError(null)
    workerRef.current?.postMessage({ type: 'pause' })
    setGridSizesByModel((current) =>
      current[modelId] === defaultGrid ? current : { ...current, [modelId]: defaultGrid },
    )
    if (modelId === 'stokes') {
      setStokesParams(defaultParams as StokesParams)
    } else if (modelId === 'platicon') {
      setPlaticonParams(defaultParams as PlaticonParams)
    } else if (modelId === 'turnkey') {
      setTurnkeyParams(defaultParams as TurnkeyParams)
    } else if (modelId === 'multicolor') {
      setMulticolorParams(defaultParams as MulticolorParams)
    } else if (modelId === 'raman') {
      setRamanParams(defaultParams as RamanParams)
    } else {
      setStandardParams(defaultParams as StandardParams)
    }
    pendingDefaultResetRef.current = { modelId, gridSize: defaultGrid, params: defaultParams }
    resetLocalBuffers()
    setResetToken((value) => value + 1)
  }

  const exportState = () => workerRef.current?.postMessage({ type: 'exportState' })

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <header className="app-header">
          <div>
            <h1>{labels.title}</h1>
            <p>{labels.subtitle}</p>
            <p className="usage-counter" id="busuanzi_container_site_pv">
              {labels.usageCount}
              <span id="busuanzi_value_site_pv">--</span>
            </p>
            <div className="model-tools">
              <label className="model-selector">
                <span>{labels.model}</span>
                <select
                  value={modelId}
                  onChange={(event) => changeModel(event.target.value as ModelId)}
                >
                  {MODEL_IDS.map((id) => (
                    <option key={id} value={id}>
                      {labels.modelLabels[id]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="docs-button"
                onClick={() => setIsDocsOpen(true)}
              >
                <BookOpen size={17} />
                <span>{labels.docs}</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            title={labels.language}
            onClick={() => setLanguage((value) => (value === 'en' ? 'zh' : 'en'))}
          >
            <Languages size={18} />
            <span>{language === 'en' ? '中文' : 'EN'}</span>
          </button>
        </header>

        <section className="panel-section">
          <div className="section-title">{labels.grid}</div>
          <div className="grid-size-list">
            {GRID_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={gridSize === size ? 'active' : ''}
                onClick={() =>
                  setGridSizesByModel((current) => ({ ...current, [modelId]: size }))
                }
              >
                {size}
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">{labels.params}</div>
          <ControlGrid
            groups={activeControlGroups}
            gridSize={gridSize}
            labels={labels}
            modelId={modelId}
            values={activeParams}
            onChange={(key, value) => {
              if (modelId === 'stokes') {
                setStokesParams((current) => ({ ...current, [key]: value }) as StokesParams)
              } else if (modelId === 'platicon') {
                setPlaticonParams(
                  (current) => ({ ...current, [key]: value }) as PlaticonParams,
                )
              } else if (modelId === 'turnkey') {
                setTurnkeyParams(
                  (current) => ({ ...current, [key]: value }) as TurnkeyParams,
                )
              } else if (modelId === 'multicolor') {
                setMulticolorParams(
                  (current) => ({ ...current, [key]: value }) as MulticolorParams,
                )
              } else if (modelId === 'raman') {
                setRamanParams((current) => ({ ...current, [key]: value }) as RamanParams)
              } else {
                setStandardParams(
                  (current) => ({ ...current, [key]: value }) as StandardParams,
                )
              }
            }}
          />
        </section>

        <section className="panel-section">
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={livePreview}
              onChange={(event) => setLivePreview(event.target.checked)}
            />
            <span>{labels.livePreview}</span>
          </label>
          <div className="transport">
            <button type="button" onClick={isRunning ? pause : start} disabled={!isReady}>
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? labels.pause : labels.play}</span>
            </button>
            <button type="button" onClick={step} disabled={!isReady || isRunning}>
              <StepForward size={18} />
              <span>{labels.step}</span>
            </button>
            <button type="button" onClick={reset} disabled={!isReady}>
              <RotateCcw size={18} />
              <span>{labels.reset}</span>
            </button>
            <button type="button" onClick={exportState} disabled={!snapshot}>
              <Download size={18} />
              <span>{labels.export}</span>
            </button>
          </div>
        </section>

        <section className="panel-section status-section">
          <div className={`status-pill ${status}`}>
            <Activity size={16} />
            <span>{statusText(labels, status, loadingMessage)}</span>
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>
      </aside>

      <main className="workspace">
        <section className="metric-strip">
          <Metric label="steps/s" value={formatNumber(metrics?.stepsPerSecond ?? 0)} />
          <Metric label="snap/s" value={formatNumber(metrics?.snapshotRate ?? 0)} />
          <Metric label="mem MB" value={formatNumber(metrics?.memoryMb ?? 0)} />
          <Metric label="batch ms" value={formatNumber(metrics?.batchMs ?? 0)} />
          <Metric label="latency ms" value={formatNumber(metrics?.latencyMs ?? 0)} />
          <Metric label="load %" value={formatNumber(metrics?.loadPercent ?? 0)} />
        </section>

        <section className="plot-grid">
          <PlotPanel
            title={labels.timeDomain}
            headerStats={temporalHeaderStats}
            x={intensityX}
            series={temporalSeries}
            xRange={THETA_RANGE}
            xTitle={TEMPORAL_X_TITLE}
            xTickLabels={THETA_TICK_LABELS}
            xTickValues={THETA_TICK_VALUES}
            yTitle={TEMPORAL_Y_TITLE}
            color="#2364aa"
          />
          <PlotPanel
            title={labels.spectrum}
            headerStats={spectrumHeaderStats}
            x={spectrumX}
            series={spectrumSeries}
            xTitle={SPECTRUM_X_TITLE}
            yTitle={labels.spectrumDb}
            color="#c43b42"
          />
          <PlotPanel
            title={labels.traces}
            x={trace.map((item) => item.step)}
            series={energySeries}
            yTitle={labels.energy}
            color="#287d5a"
            yMinSpan={ENERGY_MIN_Y_SPAN}
            yFloor={0}
          />
          {modelId === 'turnkey' ? (
            <TurnkeyStatePanel
              snapshot={isTurnkeySnapshot(snapshot) ? snapshot : null}
              params={activeParams as TurnkeyParams}
              labels={labels}
            />
          ) : (
            <section className="visual-panel waterfall-panel">
              <div className="visual-header">
                <h2>{labels.waterfall}</h2>
                <span>{activeWaterfallCount}/{HISTORY_LIMIT}</span>
              </div>
              <WaterfallPanels modelId={modelId} rows={historyRows} labels={labels} />
            </section>
          )}
        </section>

        <footer className="site-footer">
          © 2026 Binbin Nie. CyberMicrocomb. Code licensed under MIT License.
        </footer>
      </main>
      <ModelDocsPanel
        open={isDocsOpen}
        modelId={modelId}
        modelLabel={labels.modelLabels[modelId]}
        language={language}
        titleLabel={labels.modelDocs}
        closeLabel={labels.close}
        onLanguageChange={setLanguage}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  )
}

function getControlGroups(modelId: ModelId) {
  if (modelId === 'stokes') {
    return stokesControlGroups
  }
  if (modelId === 'platicon') {
    return platiconControlGroups
  }
  if (modelId === 'turnkey') {
    return turnkeyControlGroups
  }
  if (modelId === 'multicolor') {
    return multicolorControlGroups
  }
  if (modelId === 'raman') {
    return ramanControlGroups
  }
  return standardControlGroups
}

function getWaterfallCount(modelId: ModelId, rows: ModelHistoryRows) {
  if (modelId === 'stokes') {
    return Math.max(rows.primary.length, rows.stokes.length)
  }
  if (modelId === 'turnkey') {
    return rows.primary.length
  }
  if (modelId === 'multicolor') {
    return Math.max(rows.primary.length, rows.signal.length, rows.idler.length)
  }
  return rows.standard.length
}

function buildKerrTilt(pump: number, yMax: number) {
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

function buildTurnkeyLockingLine(currentAlpha: number, currentPower: number, yMin: number, yMax: number) {
  // Main-text Eq. (1) / Supplementary Eq. S17: alpha = alpha0 + 3P / 2.
  const intercept = currentAlpha - TURNKEY_LOCKING_SLOPE * currentPower
  return [
    { x: intercept + TURNKEY_LOCKING_SLOPE * yMin, y: yMin },
    { x: intercept + TURNKEY_LOCKING_SLOPE * yMax, y: yMax },
  ]
}

function mapStatePoint(
  point: ChartPoint,
  plot: { left: number; top: number; width: number; height: number },
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) {
  const x = plot.left + ((point.x - xMin) / (xMax - xMin)) * plot.width
  const y = plot.top + plot.height - ((point.y - yMin) / (yMax - yMin)) * plot.height
  return { x, y }
}

function svgPoints(points: ChartPoint[]) {
  return points
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ')
}

function buildLinearTicks(min: number, max: number, count: number) {
  if (count <= 1 || max <= min) {
    return [min]
  }
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, index) => min + step * index)
}

function formatAxisTick(value: number) {
  if (Math.abs(value) < 1e-9) {
    return '0'
  }
  if (Math.abs(value) >= 10) {
    return value.toFixed(0)
  }
  if (Math.abs(value) >= 1) {
    return value.toFixed(1).replace(/\.0$/, '')
  }
  return value.toFixed(2).replace(/0$/, '')
}

function TurnkeyStatePanel({
  snapshot,
  params,
  labels,
}: {
  snapshot: TurnkeySnapshot | null
  params: TurnkeyParams
  labels: ReturnType<typeof t>
}) {
  const detuning = snapshot?.lockedDetuning ?? params.laserDetuning
  const power = snapshot?.primaryEnergy ?? 0
  const pumpSquared = Math.max(params.pump * params.pump, 1e-6)
  const yMin = 0
  const yMax = Math.max(0.8, pumpSquared * 1.18, power * 1.35)
  const kerrTilt = buildKerrTilt(params.pump, yMax)
  const lockingLine = buildTurnkeyLockingLine(detuning, power, yMin, yMax)
  const xCandidates = [
    0,
    detuning,
    ...lockingLine.map((point) => point.x),
    ...kerrTilt.map((point) => point.x),
  ].filter((value) => Number.isFinite(value))
  const rawXMin = Math.min(...xCandidates)
  const rawXMax = Math.max(...xCandidates)
  const xPadding = Math.max(0.35, (rawXMax - rawXMin) * 0.08)
  const xMin = rawXMin - xPadding
  const xMax = rawXMax + xPadding
  const plot = { left: 82, top: 26, width: 438, height: 292 }
  const plotRight = plot.left + plot.width
  const plotBottom = plot.top + plot.height
  const statePoint = mapStatePoint({ x: detuning, y: power }, plot, xMin, xMax, yMin, yMax)
  const kerrPoints = kerrTilt.map((point) => mapStatePoint(point, plot, xMin, xMax, yMin, yMax))
  const lockPoints = lockingLine.map((point) => mapStatePoint(point, plot, xMin, xMax, yMin, yMax))
  const xTicks = buildLinearTicks(xMin, xMax, 5)
  const yTicks = buildLinearTicks(yMin, yMax, 4)

  return (
    <section className="visual-panel state-diagram-panel">
      <div className="visual-header">
        <h2>{labels.solitonState}</h2>
        <div className="visual-header-stats">
          <span className="visual-header-stat">
            <span>{labels.lockedDetuning}</span>
            <strong>{formatNumber(detuning)}</strong>
          </span>
          <span className="visual-header-stat">
            <span>{labels.intracavityPower}</span>
            <strong>{formatNumber(power)}</strong>
          </span>
        </div>
      </div>
      <svg
        className="state-diagram"
        viewBox="0 0 620 410"
        role="img"
        aria-label={`${labels.solitonState}: ${labels.lockedDetuning} ${formatNumber(detuning)}, ${labels.intracavityPower} ${formatNumber(power)}`}
      >
        <defs>
          <clipPath id="turnkeyStateClip">
            <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} />
          </clipPath>
        </defs>

        <rect
          x={plot.left}
          y={plot.top}
          width={plot.width}
          height={plot.height}
          fill="#fbfcfd"
          stroke="#1f2937"
          strokeWidth="1.8"
        />

        {xTicks.map((tick) => {
          const mapped = mapStatePoint({ x: tick, y: yMin }, plot, xMin, xMax, yMin, yMax)
          return (
            <g key={`x-${tick}`}>
              <line className="state-diagram-tick" x1={mapped.x} x2={mapped.x} y1={plotBottom} y2={plotBottom + 5} />
              <text className="state-diagram-tick-label" x={mapped.x} y={plotBottom + 19} textAnchor="middle">
                {formatAxisTick(tick)}
              </text>
            </g>
          )
        })}
        {yTicks.map((tick) => {
          const mapped = mapStatePoint({ x: xMin, y: tick }, plot, xMin, xMax, yMin, yMax)
          return (
            <g key={`y-${tick}`}>
              <line className="state-diagram-tick" x1={plot.left - 5} x2={plot.left} y1={mapped.y} y2={mapped.y} />
              <text className="state-diagram-tick-label" x={plot.left - 10} y={mapped.y + 4} textAnchor="end">
                {formatAxisTick(tick)}
              </text>
            </g>
          )
        })}

        <g clipPath="url(#turnkeyStateClip)">
          <polyline className="state-diagram-kerr" points={svgPoints(kerrPoints)} />
          <polyline className="state-diagram-locking" points={svgPoints(lockPoints)} />
        </g>
        <text className="state-diagram-region state-diagram-mi" x={plot.left + plot.width * 0.54} y={plot.top + 54}>
          {labels.miComb}
        </text>
        <text className="state-diagram-region state-diagram-soliton" x={plotRight - 22} y={plot.top + 54} textAnchor="end">
          {labels.soliton}
        </text>
        <circle
          className="state-diagram-dot"
          cx={statePoint.x}
          cy={statePoint.y}
          r="7.5"
        />

        <g className="state-diagram-legend" transform={`translate(${plot.left + 14} ${plot.top + 20})`}>
          <line className="state-diagram-kerr" x1="0" x2="28" y1="0" y2="0" />
          <text x="36" y="4">{labels.kerrTilt}</text>
        </g>
        <g className="state-diagram-legend" transform={`translate(${plot.left + 14} ${plot.top + 42})`}>
          <line className="state-diagram-locking" x1="0" x2="28" y1="0" y2="0" />
          <text x="36" y="4">{labels.lockingLine}</text>
        </g>

        <text className="state-diagram-axis" x={plot.left + plot.width / 2} y="388" textAnchor="middle">
          {labels.frequencyDetuning}
        </text>
        <text
          className="state-diagram-axis"
          textAnchor="middle"
          transform="rotate(-90 24 172)"
          x="24"
          y="172"
        >
          {labels.intracavityPower}
        </text>
      </svg>
    </section>
  )
}

function WaterfallPanels({
  modelId,
  rows,
  labels,
}: {
  modelId: ModelId
  rows: ModelHistoryRows
  labels: ReturnType<typeof t>
}) {
  if (modelId === 'stokes') {
    return (
      <div className="waterfall-pair">
        <WaterfallSubpanel title={labels.primary} rows={rows.primary} />
        <WaterfallSubpanel title={labels.stokes} rows={rows.stokes} />
      </div>
    )
  }
  if (modelId === 'turnkey') {
    return <WaterfallCanvas rows={rows.primary} label={labels.primary} />
  }
  if (modelId === 'multicolor') {
    return (
      <div className="waterfall-pair waterfall-triple">
        <WaterfallSubpanel title={labels.primary} rows={rows.primary} />
        <WaterfallSubpanel title={labels.signal} rows={rows.signal} />
        <WaterfallSubpanel title={labels.idler} rows={rows.idler} />
      </div>
    )
  }
  return <WaterfallCanvas rows={rows.standard} />
}

function WaterfallSubpanel({ title, rows }: { title: string; rows: Float32Array[] }) {
  return (
    <div className="waterfall-subpanel">
      <div className="waterfall-subheader">{title}</div>
      <WaterfallCanvas rows={rows} label={title} />
    </div>
  )
}

function ControlGrid({
  groups,
  gridSize,
  labels,
  modelId,
  values,
  onChange,
}: {
  groups: readonly ControlGroupDefinition[]
  gridSize: GridSize
  labels: ReturnType<typeof t>
  modelId: ModelId
  values: SimulationParams
  onChange: (key: string, value: number) => void
}) {
  const valuesByKey = values as unknown as Record<string, number>
  return (
    <div className="control-groups">
      {groups.map((group, groupIndex) => (
        <div key={group.titleKey ?? groupIndex} className="control-group">
          {group.titleKey && (
            <div className="control-subtitle">
              {labels.controlGroups[group.titleKey as keyof typeof labels.controlGroups]}
            </div>
          )}
          <div className="control-grid">
            {group.controls.map((control) => {
              const { key, step } = control
              const { min, max } = controlRange(control, gridSize)
              const value = valuesByKey[key] ?? 0
              const label = parameterLabel(labels, modelId, key)
              const help = parameterHelp(labels, modelId, key)
              const helpId = `parameter-help-${key}`
              return (
                <label key={key} className="control-row">
                  <span className="control-label">
                    <span className="control-label-text">{label}</span>
                    {help && (
                      <span id={helpId} className="parameter-tooltip" role="tooltip">
                        {help.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    aria-label={label}
                    aria-describedby={help ? helpId : undefined}
                    onChange={(event) =>
                      onChange(key, clampControlValue(Number(event.target.value), min, max))
                    }
                  />
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    aria-label={label}
                    aria-describedby={help ? helpId : undefined}
                    onChange={(event) =>
                      onChange(key, clampControlValue(Number(event.target.value), min, max))
                    }
                  />
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function parameterLabel(labels: ReturnType<typeof t>, modelId: ModelId, key: string) {
  if (modelId === 'multicolor') {
    const modelLabels = labels.modelParameterLabels.multicolor
    return modelLabels[key as keyof typeof modelLabels] ?? parameterLabelFallback(labels, key)
  }
  return parameterLabelFallback(labels, key)
}

function parameterLabelFallback(labels: ReturnType<typeof t>, key: string) {
  return labels.parameterLabels[key as keyof typeof labels.parameterLabels] ?? key
}

function parameterHelp(labels: ReturnType<typeof t>, modelId: ModelId, key: string) {
  if (modelId === 'multicolor') {
    const modelHelp = labels.modelParameterHelp.multicolor
    return modelHelp[key as keyof typeof modelHelp] ?? parameterHelpFallback(labels, key)
  }
  return parameterHelpFallback(labels, key)
}

function parameterHelpFallback(labels: ReturnType<typeof t>, key: string) {
  return labels.parameterHelp[key as keyof typeof labels.parameterHelp]
}

function syncClampedDt(
  snapshot: Snapshot,
  setters: {
    standard: Dispatch<SetStateAction<StandardParams>>
    platicon: Dispatch<SetStateAction<PlaticonParams>>
    stokes: Dispatch<SetStateAction<StokesParams>>
    turnkey: Dispatch<SetStateAction<TurnkeyParams>>
    multicolor: Dispatch<SetStateAction<MulticolorParams>>
    raman: Dispatch<SetStateAction<RamanParams>>
  },
) {
  if (snapshot.modelId === 'stokes') {
    setters.stokes((current) =>
      snapshot.normalizedParams.dt < current.dt - 1e-12
        ? { ...current, dt: snapshot.normalizedParams.dt }
        : current,
    )
    return
  }
  if (snapshot.modelId === 'platicon') {
    setters.platicon((current) =>
      snapshot.normalizedParams.dt < current.dt - 1e-12
        ? { ...current, dt: snapshot.normalizedParams.dt }
        : current,
    )
    return
  }
  if (snapshot.modelId === 'turnkey') {
    setters.turnkey((current) =>
      snapshot.normalizedParams.dt < current.dt - 1e-12
        ? { ...current, dt: snapshot.normalizedParams.dt }
        : current,
    )
    return
  }
  if (snapshot.modelId === 'multicolor') {
    setters.multicolor((current) =>
      snapshot.normalizedParams.dt < current.dt - 1e-12
        ? { ...current, dt: snapshot.normalizedParams.dt }
        : current,
    )
    return
  }
  if (snapshot.modelId === 'raman') {
    setters.raman((current) =>
      snapshot.normalizedParams.dt < current.dt - 1e-12
        ? { ...current, dt: snapshot.normalizedParams.dt }
        : current,
    )
    return
  }
  setters.standard((current) =>
    snapshot.normalizedParams.dt < current.dt - 1e-12
      ? { ...current, dt: snapshot.normalizedParams.dt }
      : current,
  )
}

function tracePointFromSnapshot(snapshot: Snapshot): TracePoint {
  if (snapshot.modelId === 'stokes') {
    return {
      step: snapshot.step,
      primaryEnergy: snapshot.primaryEnergy,
      stokesEnergy: snapshot.stokesEnergy,
    }
  }
  if (snapshot.modelId === 'turnkey') {
    return {
      step: snapshot.step,
      primaryEnergy: snapshot.primaryEnergy,
      backwardEnergy: snapshot.backwardEnergy,
    }
  }
  if (snapshot.modelId === 'multicolor') {
    return {
      step: snapshot.step,
      primaryEnergy: snapshot.primaryEnergy,
      signalEnergy: snapshot.signalEnergy,
      idlerEnergy: snapshot.idlerEnergy,
    }
  }
  if (snapshot.modelId === 'raman') {
    return {
      step: snapshot.step,
      energy: snapshot.energy,
      pulseWidthFs: snapshot.pulseWidthFs,
      selfFrequencyShiftThz: snapshot.selfFrequencyShiftThz,
    }
  }
  return { step: snapshot.step, energy: snapshot.energy }
}

function appendHistoryRows(rows: ModelHistoryRows, snapshot: Snapshot): ModelHistoryRows {
  if (snapshot.modelId === 'stokes') {
    return {
      standard: [],
      primary: [...rows.primary, snapshot.primaryHistoryRow].slice(-HISTORY_LIMIT),
      stokes: [...rows.stokes, snapshot.stokesHistoryRow].slice(-HISTORY_LIMIT),
      backward: [],
      signal: [],
      idler: [],
    }
  }
  if (snapshot.modelId === 'turnkey') {
    return {
      standard: [],
      primary: [...rows.primary, snapshot.primaryHistoryRow].slice(-HISTORY_LIMIT),
      stokes: [],
      backward: [...rows.backward, snapshot.backwardHistoryRow].slice(-HISTORY_LIMIT),
      signal: [],
      idler: [],
    }
  }
  if (snapshot.modelId === 'multicolor') {
    return {
      standard: [],
      primary: [...rows.primary, snapshot.primaryHistoryRow].slice(-HISTORY_LIMIT),
      stokes: [],
      backward: [],
      signal: [...rows.signal, snapshot.signalHistoryRow].slice(-HISTORY_LIMIT),
      idler: [...rows.idler, snapshot.idlerHistoryRow].slice(-HISTORY_LIMIT),
    }
  }
  return {
    standard: [...rows.standard, snapshot.historyRow].slice(-HISTORY_LIMIT),
    primary: [],
    stokes: [],
    backward: [],
    signal: [],
    idler: [],
  }
}

function emptyHistoryRows(): ModelHistoryRows {
  return { standard: [], primary: [], stokes: [], backward: [], signal: [], idler: [] }
}

function getFieldLength(snapshot: Snapshot) {
  return isTwoFieldSnapshot(snapshot) || snapshot.modelId === 'multicolor'
    ? snapshot.primaryIntensity.length
    : snapshot.intensity.length
}

function getSpectrumLength(snapshot: Snapshot) {
  return isTwoFieldSnapshot(snapshot) || snapshot.modelId === 'multicolor'
    ? snapshot.primarySpectrumDb.length
    : snapshot.spectrumDb.length
}

function getTemporalSeries(snapshot: Snapshot | null, labels: ReturnType<typeof t>) {
  if (!snapshot) {
    return [{ name: labels.intensity, y: [] }]
  }
  if (snapshot.modelId === 'stokes') {
    return [
      { name: `${labels.primary} |P|^2`, y: snapshot.primaryIntensity, color: '#2364aa' },
      { name: `${labels.stokes} |S|^2`, y: snapshot.stokesIntensity, color: '#c43b42' },
    ]
  }
  if (snapshot.modelId === 'turnkey') {
    return [
      { name: `${labels.primary} |P|^2`, y: snapshot.primaryIntensity, color: '#2364aa' },
    ]
  }
  if (snapshot.modelId === 'multicolor') {
    return [
      { name: `${labels.primary} |P|^2`, y: snapshot.primaryIntensity, color: '#2364aa' },
      { name: `${labels.signal} |S|^2`, y: snapshot.signalIntensity, color: '#c43b42' },
      { name: `${labels.idler} |I|^2`, y: snapshot.idlerIntensity, color: '#7a5cff' },
    ]
  }
  return [{ name: labels.intensity, y: snapshot.intensity }]
}

function getSpectrumSeries(snapshot: Snapshot | null, labels: ReturnType<typeof t>) {
  if (!snapshot) {
    return [{ name: labels.spectrumDb, y: [] }]
  }
  if (snapshot.modelId === 'stokes') {
    return [
      { name: labels.primary, y: snapshot.primarySpectrumDb, color: '#2364aa' },
      { name: labels.stokes, y: snapshot.stokesSpectrumDb, color: '#c43b42' },
    ]
  }
  if (snapshot.modelId === 'turnkey') {
    return [
      { name: labels.primary, y: snapshot.primarySpectrumDb, color: '#2364aa' },
    ]
  }
  if (snapshot.modelId === 'multicolor') {
    return [
      { name: labels.primary, y: snapshot.primarySpectrumDb, color: '#2364aa' },
      { name: labels.signal, y: snapshot.signalSpectrumDb, color: '#c43b42' },
      { name: labels.idler, y: snapshot.idlerSpectrumDb, color: '#7a5cff' },
    ]
  }
  return [{ name: labels.spectrumDb, y: snapshot.spectrumDb }]
}

function getEnergySeries(
  modelId: ModelId,
  trace: TracePoint[],
  labels: ReturnType<typeof t>,
) {
  if (modelId === 'stokes') {
    return [
      {
        name: labels.primary,
        y: trace.map((item) => item.primaryEnergy ?? 0),
        color: '#287d5a',
      },
      {
        name: labels.stokes,
        y: trace.map((item) => item.stokesEnergy ?? 0),
        color: '#c43b42',
      },
    ]
  }
  if (modelId === 'turnkey') {
    return [
      {
        name: labels.primary,
        y: trace.map((item) => item.primaryEnergy ?? 0),
        color: '#287d5a',
      },
    ]
  }
  if (modelId === 'multicolor') {
    return [
      {
        name: labels.primary,
        y: trace.map((item) => item.primaryEnergy ?? 0),
        color: '#287d5a',
      },
      {
        name: labels.signal,
        y: trace.map((item) => item.signalEnergy ?? 0),
        color: '#c43b42',
      },
      {
        name: labels.idler,
        y: trace.map((item) => item.idlerEnergy ?? 0),
        color: '#7a5cff',
      },
    ]
  }
  return [{ name: labels.energy, y: trace.map((item) => item.energy ?? 0) }]
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

function isTwoFieldSnapshot(
  snapshot: Snapshot,
): snapshot is StokesSnapshot | TurnkeySnapshot {
  return snapshot.modelId === 'stokes' || snapshot.modelId === 'turnkey'
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

function clampControlValue(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(max, Math.max(min, value))
}

function controlRange(control: ControlDefinition, gridSize: GridSize) {
  if (control.key !== 'modeShiftMu') {
    return { min: control.min, max: control.max }
  }
  const { minMu, maxMu } = modeShiftBounds(gridSize)
  return { min: minMu, max: maxMu }
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function statusText(
  labels: ReturnType<typeof t>,
  status: WorkerStatus,
  loadingMessage: string,
) {
  if (status === 'loading') {
    return loadingMessage || labels.loading
  }
  if (status === 'ready') {
    return labels.ready
  }
  if (status === 'running') {
    return labels.running
  }
  if (status === 'paused') {
    return labels.paused
  }
  if (status === 'error') {
    return labels.error
  }
  return status
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

function buildExportPayload(solverState: unknown, source: ExportPlotSource) {
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asNumberArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'number') : []
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '0'
  }
  if (Math.abs(value) >= 1e4 || (Math.abs(value) > 0 && Math.abs(value) < 1e-3)) {
    return value.toExponential(2)
  }
  return value.toLocaleString(undefined, { maximumSignificantDigits: 4 })
}

function downloadJson(payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `cybermicrocomb-state-${Date.now()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default App
