import { onBeforeUnmount, onMounted, ref } from 'vue'

export const useTicker = () => {
  const now = ref(Date.now())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer !== undefined) {
      window.clearInterval(timer)
    }
  })

  return { now }
}
