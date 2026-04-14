import { onMounted, onUnmounted } from 'vue'

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  alpha: number
}

export const useWaterRipple = (containerRef: () => HTMLElement | null) => {
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let animId = 0
  const ripples: Ripple[] = []
  let lastMouseX = -1
  let lastMouseY = -1

  const resize = () => {
    const el = containerRef()
    if (!el || !canvas) return
    canvas.width = el.clientWidth
    canvas.height = el.clientHeight
  }

  const addRipple = (x: number, y: number) => {
    ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: 80 + Math.random() * 60,
      speed: 1.5 + Math.random() * 1,
      alpha: 0.35
    })
    if (ripples.length > 30) ripples.shift()
  }

  const onMouseMove = (e: MouseEvent) => {
    const el = containerRef()
    if (!el || !canvas) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - lastMouseX
    const dy = y - lastMouseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 20) {
      addRipple(x, y)
      lastMouseX = x
      lastMouseY = y
    }
  }

  const draw = () => {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const theme = document.documentElement.dataset.theme
    const isDark = theme === 'dark' || theme === 'one-dark'

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      r.radius += r.speed
      r.alpha -= 0.004

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1)
        continue
      }

      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.strokeStyle = isDark
        ? `rgba(97, 175, 239, ${r.alpha})`
        : `rgba(0, 113, 227, ${r.alpha})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    animId = requestAnimationFrame(draw)
  }

  onMounted(() => {
    const el = containerRef()
    if (!el) return
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;'
    el.style.position = 'relative'
    el.insertBefore(canvas, el.firstChild)
    ctx = canvas.getContext('2d')!
    resize()
    window.addEventListener('resize', resize)
    el.addEventListener('mousemove', onMouseMove)
    draw()
  })

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
    const el = containerRef()
    if (el) el.removeEventListener('mousemove', onMouseMove)
    if (canvas) canvas.remove()
  })
}
