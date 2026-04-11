import { ref } from 'vue'
import en from '../i18n/en'
import zh from '../i18n/zh'

type LocalePreference = 'system' | 'en' | 'zh'
const messages = { en, zh }

export const useI18n = () => {
  const locale = ref<LocalePreference>('system')

  const resolvedLocale = () => {
    if (locale.value === 'en' || locale.value === 'zh') {
      return locale.value
    }

    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }

  const t = (key: keyof typeof en) => messages[resolvedLocale()][key]
  const setLocale = (value: LocalePreference) => {
    locale.value = value
  }

  return { locale, setLocale, t }
}
