import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import type { Config, Data, Layout } from 'plotly.js'

interface Series {
  name: string
  y: ArrayLike<number>
}

export function PlotPanel({
  title,
  x,
  series,
  yTitle,
  color,
  yMinSpan,
  yFloor,
}: {
  title: string
  x: ArrayLike<number>
  series: Series[]
  yTitle: string
  color: string
  yMinSpan?: number
  yFloor?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const traces: Data[] = series.map((item, index) => ({
      type: 'scatter',
      mode: 'lines',
      name: item.name,
      x: Array.from(x),
      y: Array.from(item.y),
      line: {
        color: index === 0 ? color : '#f28f3b',
        width: 2,
      },
    }) as Data)

    const layout: Partial<Layout> = {
      autosize: true,
      margin: { l: 52, r: 18, t: 12, b: 38 },
      paper_bgcolor: 'rgba(255,255,255,0)',
      plot_bgcolor: '#fbfcfd',
      font: { family: 'Inter, system-ui, sans-serif', size: 12, color: '#28313d' },
      xaxis: {
        showgrid: false,
        zeroline: false,
      },
      yaxis: {
        title: { text: yTitle },
        range: getMinimumYRange(series, yMinSpan, yFloor),
        showgrid: false,
        zeroline: false,
      },
      showlegend: series.length > 1,
      legend: { orientation: 'h', x: 0, y: 1.16 },
    }
    const config: Partial<Config> = {
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: ['select2d', 'lasso2d'],
    }

    Plotly.react(ref.current, traces, layout, config)
  }, [color, series, x, yFloor, yMinSpan, yTitle])

  useEffect(() => {
    const node = ref.current
    return () => {
      if (node) {
        Plotly.purge(node)
      }
    }
  }, [])

  return (
    <section className="visual-panel">
      <div className="visual-header">
        <h2>{title}</h2>
      </div>
      <div ref={ref} className="plot-surface" />
    </section>
  )
}

function getMinimumYRange(
  series: Series[],
  yMinSpan?: number,
  yFloor?: number,
): [number, number] | undefined {
  if (!yMinSpan || yMinSpan <= 0) {
    return undefined
  }

  const values = series.flatMap((item) =>
    Array.from(item.y).filter((value) => Number.isFinite(value)),
  )
  if (values.length === 0) {
    return undefined
  }

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const span = maxValue - minValue
  if (span >= yMinSpan) {
    return undefined
  }

  const center = (minValue + maxValue) / 2
  let lower = center - yMinSpan / 2
  let upper = center + yMinSpan / 2
  if (yFloor !== undefined && lower < yFloor) {
    upper += yFloor - lower
    lower = yFloor
  }

  return [lower, upper]
}
