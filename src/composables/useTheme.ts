import { computed, ref, watch } from 'vue'
import { THEME_STORAGE_KEY } from '../constants/app'

type ThemePreference = 'system' | 'light' | 'dark' | 'one-dark'
type ResolvedTheme = 'light' | 'dark' | 'one-dark'

const TITLEBAR_COLORS: Record<ResolvedTheme, { bg: string; text: string }> = {
  light: { bg: '#f5f5f7', text: '#1d1d1f' },
  dark: { bg: '#000000', text: '#ffffff' },
  'one-dark': { bg: '#282c34', text: '#abb2bf' }
}

const readStored = (): ThemePreference => {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system' || raw === 'one-dark') {
    return raw
  }
  return 'one-dark'
}

const applyTitleBar = (theme: ResolvedTheme) => {
  if (window.electron?.setTitleBarTheme) {
    window.electron.setTitleBarTheme(TITLEBAR_COLORS[theme])
  }
}

export const useTheme = () => {
  const preference = ref<ThemePreference>(readStored())

  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (preference.value === 'light' || preference.value === 'dark' || preference.value === 'one-dark') {
      return preference.value
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const setTheme = (value: ThemePreference) => {
    preference.value = value
    localStorage.setItem(THEME_STORAGE_KEY, value)
    document.documentElement.dataset.theme = resolvedTheme.value
    applyTitleBar(resolvedTheme.value)
  }

  watch(resolvedTheme, (theme) => {
    document.documentElement.dataset.theme = theme
    applyTitleBar(theme)
  }, { immediate: true })

  return { preference, resolvedTheme, setTheme }
}
