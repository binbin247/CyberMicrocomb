import standardEn from '../../docs/models/standard-soliton.en.md?raw'
import standardZh from '../../docs/models/standard-soliton.md?raw'
import platiconEn from '../../docs/models/standard-dark-pulse-platicon.en.md?raw'
import platiconZh from '../../docs/models/standard-dark-pulse-platicon.md?raw'
import stokesEn from '../../docs/models/stokes-soliton.en.md?raw'
import stokesZh from '../../docs/models/stokes-soliton.md?raw'
import turnkeyEn from '../../docs/models/turnkey-soliton.en.md?raw'
import turnkeyZh from '../../docs/models/turnkey-soliton.md?raw'
import multicolorEn from '../../docs/models/multicolor-soliton.en.md?raw'
import multicolorZh from '../../docs/models/multicolor-soliton.md?raw'
import ramanEn from '../../docs/models/raman-soliton-ssfs.en.md?raw'
import ramanZh from '../../docs/models/raman-soliton-ssfs.md?raw'
import type { Language, ModelId } from '../types'

export const modelDocs: Record<Language, Record<ModelId, string>> = {
  en: {
    standard: standardEn,
    platicon: platiconEn,
    stokes: stokesEn,
    turnkey: turnkeyEn,
    multicolor: multicolorEn,
    raman: ramanEn,
  },
  zh: {
    standard: standardZh,
    platicon: platiconZh,
    stokes: stokesZh,
    turnkey: turnkeyZh,
    multicolor: multicolorZh,
    raman: ramanZh,
  },
}
