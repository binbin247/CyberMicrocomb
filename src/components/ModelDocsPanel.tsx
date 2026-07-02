import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { modelDocs } from '../lib/modelDocs'
import type { Language, ModelId } from '../types'

interface ModelDocsPanelProps {
  open: boolean
  modelId: ModelId
  modelLabel: string
  language: Language
  closeLabel: string
  onClose: () => void
}

export function ModelDocsPanel({
  open,
  modelId,
  modelLabel,
  language,
  closeLabel,
  onClose,
}: ModelDocsPanelProps) {
  if (!open) {
    return null
  }

  return (
    <div className="docs-overlay" role="presentation" onClick={onClose}>
      <aside
        aria-label={`${modelLabel} documentation`}
        className="docs-drawer"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="docs-header">
          <div>
            <span>Model docs</span>
            <h2>{modelLabel}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
            <span>{closeLabel}</span>
          </button>
        </header>
        <div className="docs-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {modelDocs[language][modelId]}
          </ReactMarkdown>
        </div>
      </aside>
    </div>
  )
}
