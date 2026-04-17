import { ref, watch } from 'vue'

export type LayoutMode = 'grid' | 'list' | 'circular'

const STORAGE_KEY = 'layout-preference'

const stored = typeof localStorage !== 'undefined'
  ? localStorage.getItem(STORAGE_KEY) as LayoutMode | null
  : null

const mode = ref<LayoutMode>(stored === 'grid' || stored === 'list' || stored === 'circular' ? stored : 'grid')

watch(mode, (value) => {
  localStorage.setItem(STORAGE_KEY, value)
})

export const useLayoutPreference = () => ({
  mode,
  setMode: (m: LayoutMode) => { mode.value = m }
})
