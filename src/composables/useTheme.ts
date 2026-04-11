import { computed, ref } from 'vue'

type ThemePreference = 'system' | 'light' | 'dark'

export const useTheme = () => {
  const preference = ref<ThemePreference>('system')

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (preference.value === 'light' || preference.value === 'dark') {
      return preference.value
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const setTheme = (value: ThemePreference) => {
    preference.value = value
    document.documentElement.dataset.theme = resolvedTheme.value
  }

  return { preference, resolvedTheme, setTheme }
}
