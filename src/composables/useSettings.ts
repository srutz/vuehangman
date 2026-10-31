import { ref, watch } from 'vue'

export type UmlautMode = 'umlauts' | 'digraphs'

export type Settings = {
  /** `umlauts`: Ä Ö Ü are letters. `digraphs`: they are written AE, OE, UE instead. */
  umlautMode: UmlautMode
}

const STORAGE_KEY = 'hangman.settings'
const DEFAULTS: Settings = { umlautMode: 'digraphs' }

function load(): Settings {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      umlautMode: parsed.umlautMode === 'umlauts' ? 'umlauts' : DEFAULTS.umlautMode,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

// Module-level state so every caller (keyboard, views, ...) shares the same settings.
const settings = ref<Settings>(load())

watch(
  settings,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      /* storage unavailable (private mode etc.) – keep the setting in memory only */
    }
  },
  { deep: true },
)

const DIGRAPHS: Record<string, string> = { Ä: 'AE', Ö: 'OE', Ü: 'UE' }

/** Replace Ä/Ö/Ü by AE/OE/UE. */
export function toDigraphs(word: string) {
  return word.replace(/[ÄÖÜ]/g, (c) => DIGRAPHS[c]!)
}

export function hasUmlauts(word: string) {
  return /[ÄÖÜ]/.test(word)
}

export function useSettings() {
  /** Convert a word to the spelling demanded by the current settings. */
  function applyToWord(word: string) {
    const upper = word.toUpperCase()
    return settings.value.umlautMode === 'digraphs' ? toDigraphs(upper) : upper
  }

  return { settings, applyToWord }
}
