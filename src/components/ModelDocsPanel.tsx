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
  titleLabel: string
  closeLabel: string
  onLanguageChange: (language: Language) => void
  onClose: () => void
}

export function ModelDocsPanel({
  open,
  modelId,
  modelLabel,
  language,
  titleLabel,
  closeLabel,
  onLanguageChange,
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
            <span>{titleLabel}</span>
            <h2>{modelLabel}</h2>
          </div>
          <div className="docs-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
            >
              <span>{language === 'en' ? '中文' : 'EN'}</span>
            </button>
            <button type="button" className="icon-button" onClick={onClose}>
              <X size={18} />
              <span>{closeLabel}</span>
            </button>
          </div>
        </header>
        <div className="docs-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({ children, href, ...props }) => {
                const targetLanguage = languageFromDocsHref(href)
                if (targetLanguage) {
                  return (
                    <button
                      type="button"
                      className="docs-inline-link"
                      onClick={() => onLanguageChange(targetLanguage)}
                    >
                      {children}
                    </button>
                  )
                }
                return (
                  <a {...props} href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                )
              },
            }}
          >
            {normalizeInlineMath(modelDocs[language][modelId])}
          </ReactMarkdown>
        </div>
      </aside>
    </div>
  )
}

function normalizeInlineMath(markdown: string) {
  return markdown.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => `$${math}$`)
}

function languageFromDocsHref(href: string | undefined): Language | null {
  if (!href?.startsWith('./') || !href.endsWith('.md')) {
    return null
  }
  return href.endsWith('.en.md') ? 'en' : 'zh'
}
