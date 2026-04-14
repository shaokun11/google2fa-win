import { onMounted, onUnmounted } from 'vue'

interface Ripple {
  x: number
  y: number
  age: number
  maxAge: number
  strength: number
}

export const useWaterRipple = (containerRef: () => HTMLElement | null) => {
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let animId = 0
  const ripples: Ripple[] = []
  let lastMouseX = -1
  let lastMouseY = -1
  let mouseX = -1
  let mouseY = -1
  let prevMouseX = -1
  let prevMouseY = -1
  let mouseSpeed = 0
  let time = 0

  const resize = () => {
    const el = containerRef()
    if (!el || !canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = el.clientWidth
    const h = el.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const addRipple = (x: number, y: number, strength: number) => {
    ripples.push({
      x,
      y,
      age: 0,
      maxAge: 180 + Math.random() * 60,
      strength: Math.min(strength, 1.2)
    })
    if (ripples.length > 50) ripples.splice(0, ripples.length - 50)
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

    prevMouseX = mouseX
    prevMouseY = mouseY
    mouseX = x
    mouseY = y
    mouseSpeed = dist

    if (dist > 12) {
      const strength = Math.min(dist / 40, 1)
      addRipple(x, y, strength)
      lastMouseX = x
      lastMouseY = y
    }
  }

  const draw = () => {
    if (!ctx || !canvas) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    ctx.clearRect(0, 0, w, h)

    time += 0.016

    const theme = document.documentElement.dataset.theme
    const isDark = theme === 'dark' || theme === 'one-dark'

    // Ambient water caustic light dots
    drawCaustics(ctx, w, h, isDark, time)

    // Draw each ripple with multi-ring wave propagation
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      r.age++

      if (r.age >= r.maxAge) {
        ripples.splice(i, 1)
        continue
      }

      const life = 1 - r.age / r.maxAge
      const ease = life * life
      drawRippleWaves(ctx, r, ease, isDark)
    }

    // Mouse proximity glow (subtle cursor light)
    if (mouseX >= 0 && mouseY >= 0) {
      drawCursorGlow(ctx, mouseX, mouseY, mouseSpeed, isDark)
    }

    animId = requestAnimationFrame(draw)
  }

  const drawRippleWaves = (
    ctx: CanvasRenderingContext2D,
    ripple: Ripple,
    life: number,
    isDark: boolean
  ) => {
    const maxR = 120 + ripple.strength * 80
    const waveCount = 4
    const speed = 1.2 + ripple.strength * 0.8

    for (let w = 0; w < waveCount; w++) {
      const waveOffset = w * 18
      const radius = ripple.age * speed - waveOffset

      if (radius <= 0 || radius >= maxR) continue

      const waveLife = 1 - radius / maxR
      const alpha = waveLife * life * ripple.strength * 0.4
      if (alpha < 0.005) continue

      const lineW = (1 + waveLife * 2) * (isDark ? 1.2 : 0.8)

      // Sine-modulated radius for organic shape
      ctx.beginPath()
      const segments = 60
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2
        const sineWobble = Math.sin(angle * 3 + ripple.age * 0.04 + w) * 2 * waveLife
        const r = radius + sineWobble
        const px = ripple.x + Math.cos(angle) * r
        const py = ripple.y + Math.sin(angle) * r
        if (s === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()

      // Outer glow ring
      if (w === 0 && waveLife > 0.3) {
        ctx.strokeStyle = isDark
          ? `rgba(97, 175, 239, ${alpha * 0.15})`
          : `rgba(0, 113, 227, ${alpha * 0.12})`
        ctx.lineWidth = lineW + 4
        ctx.stroke()
      }

      // Main wave ring with gradient-like stroke
      const hue = isDark ? 210 : 210
      const sat = isDark ? '60%' : '70%'
      const lit = isDark ? '72%' : '50%'
      ctx.strokeStyle = `hsla(${hue}, ${sat}, ${lit}, ${alpha})`
      ctx.lineWidth = lineW
      ctx.stroke()
    }

    // Center highlight dot (light refraction flash)
    if (life > 0.6) {
      const flashAlpha = (life - 0.6) * 2.5 * ripple.strength * 0.25
      const grad = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, 15)
      grad.addColorStop(0, isDark
        ? `rgba(180, 220, 255, ${flashAlpha})`
        : `rgba(255, 255, 255, ${flashAlpha})`
      )
      grad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, 15, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }
  }

  const drawCaustics = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    isDark: boolean,
    t: number
  ) => {
    const count = 18
    for (let i = 0; i < count; i++) {
      const phase = i * 1.37
      const cx = (Math.sin(t * 0.3 + phase) * 0.4 + 0.5) * w
      const cy = (Math.cos(t * 0.25 + phase * 0.7) * 0.4 + 0.5) * h
      const r = 20 + Math.sin(t * 0.5 + phase) * 10
      const alpha = 0.015 + Math.sin(t * 0.4 + phase) * 0.008

      if (alpha <= 0) continue

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, isDark
        ? `rgba(97, 175, 239, ${alpha})`
        : `rgba(0, 113, 227, ${alpha * 0.8})`
      )
      grad.addColorStop(0.6, isDark
        ? `rgba(97, 175, 239, ${alpha * 0.3})`
        : `rgba(0, 113, 227, ${alpha * 0.2})`
      )
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }
  }

  const drawCursorGlow = (
    ctx: CanvasRenderingContext2D,
    mx: number,
    my: number,
    speed: number,
    isDark: boolean
  ) => {
    const intensity = Math.min(speed / 30, 1) * 0.12 + 0.04
    const size = 40 + speed * 0.8

    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, size)
    grad.addColorStop(0, isDark
      ? `rgba(97, 175, 239, ${intensity})`
      : `rgba(0, 113, 227, ${intensity * 0.7})`
    )
    grad.addColorStop(0.5, isDark
      ? `rgba(97, 175, 239, ${intensity * 0.3})`
      : `rgba(0, 113, 227, ${intensity * 0.2})`
    )
    grad.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.arc(mx, my, size, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    // Boat-wake V shape behind cursor direction
    if (speed > 8 && prevMouseX >= 0) {
      const dx = mx - prevMouseX
      const dy = my - prevMouseY
      const angle = Math.atan2(dy, dx)
      const wakeLen = 30 + speed * 1.5
      const wakeSpread = 0.35 + speed * 0.005
      const wakeAlpha = Math.min(speed / 40, 1) * 0.15

      ctx.beginPath()
      ctx.moveTo(mx, my)

      // Left wing
      const la = angle + Math.PI - wakeSpread
      ctx.lineTo(mx + Math.cos(la) * wakeLen, my + Math.sin(la) * wakeLen)

      // Right wing
      ctx.moveTo(mx, my)
      const ra = angle + Math.PI + wakeSpread
      ctx.lineTo(mx + Math.cos(ra) * wakeLen, my + Math.sin(ra) * wakeLen)

      ctx.strokeStyle = isDark
        ? `rgba(97, 175, 239, ${wakeAlpha})`
        : `rgba(0, 113, 227, ${wakeAlpha})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Wake fill (subtle)
      ctx.beginPath()
      ctx.moveTo(mx, my)
      ctx.lineTo(mx + Math.cos(la) * wakeLen, my + Math.sin(la) * wakeLen)
      ctx.lineTo(mx + Math.cos(ra) * wakeLen, my + Math.sin(ra) * wakeLen)
      ctx.closePath()

      const wakeGrad = ctx.createRadialGradient(mx, my, 0, mx, my, wakeLen)
      wakeGrad.addColorStop(0, isDark
        ? `rgba(97, 175, 239, ${wakeAlpha * 0.5})`
        : `rgba(0, 113, 227, ${wakeAlpha * 0.3})`
      )
      wakeGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = wakeGrad
      ctx.fill()
    }
  }

  onMounted(() => {
    const el = containerRef()
    if (!el) return
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;'
    el.style.position = 'relative'
    el.insertBefore(canvas, el.firstChild)
    ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }
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
