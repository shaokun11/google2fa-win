import { ref } from 'vue'
import en from '../i18n/en'
import zh from '../i18n/zh'
import { LOCALE_STORAGE_KEY } from '../constants/app'

type LocalePreference = 'system' | 'en' | 'zh'
const messages = { en, zh }

const readStored = (): LocalePreference => {
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (raw === 'en' || raw === 'zh' || raw === 'system') {
    return raw
  }
  return 'en'
}

export const useI18n = () => {
  const locale = ref<LocalePreference>(readStored())

  const resolvedLocale = () => {
    if (locale.value === 'en' || locale.value === 'zh') {
      return locale.value
    }

    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }

  const t = (key: keyof typeof en) => messages[resolvedLocale()][key]
  const setLocale = (value: LocalePreference) => {
    locale.value = value
    localStorage.setItem(LOCALE_STORAGE_KEY, value)
  }

  return { locale, setLocale, t }
}
