import { computed, ref, watch } from 'vue'
import { THEME_STORAGE_KEY } from '../constants/app'

type ThemePreference = 'system' | 'light' | 'dark' | 'one-dark'
type ResolvedTheme = 'light' | 'dark' | 'one-dark'

const readStored = (): ThemePreference => {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system' || raw === 'one-dark') {
    return raw
  }
  return 'system'
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
  }

  watch(resolvedTheme, (theme) => {
    document.documentElement.dataset.theme = theme
  }, { immediate: true })

  return { preference, resolvedTheme, setTheme }
}
