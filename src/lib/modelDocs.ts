import standardEn from '../../docs/models/standard-soliton.en.md?raw'
import standardZh from '../../docs/models/standard-soliton.md?raw'
import platiconEn from '../../docs/models/standard-dark-pulse-platicon.en.md?raw'
import platiconZh from '../../docs/models/standard-dark-pulse-platicon.md?raw'
import stokesEn from '../../docs/models/stokes-soliton.en.md?raw'
import stokesZh from '../../docs/models/stokes-soliton.md?raw'
import type { Language, ModelId } from '../types'

export const modelDocs: Record<Language, Record<ModelId, string>> = {
  en: {
    standard: standardEn,
    platicon: platiconEn,
    stokes: stokesEn,
  },
  zh: {
    standard: standardZh,
    platicon: platiconZh,
    stokes: stokesZh,
  },
}
