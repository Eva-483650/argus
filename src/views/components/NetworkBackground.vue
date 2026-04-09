<template>
  <canvas ref="canvasRef" class="network-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'light' // 'dark' | 'light'
  }
})

const canvasRef = ref(null)

let ctx = null
let animationId = null
let particles = []
let width = 0
let height = 0
let time = 0

const mouse = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  active: false
}

const CONFIG = {
  particleCount: 260,
  linkDistance: 135,
  ribbonStartX: 0.1,
  ribbonEndX: 0.9
}

const THEMES = {
  dark: {
    baseBg: '#020817',
    bgStops: ['#010611', '#03111d', '#020617'],
    leftGlow: '0, 220, 255',
    midGlow: '176, 180, 255',
    rightGlow: '214, 84, 255',
    leftGlowAlphaBase: 0.05,
    leftGlowAlphaBreath: 0.035,
    rightGlowAlphaBase: 0.05,
    rightGlowAlphaBreath: 0.035,

    ribbonStops: [
      'rgba(0, 220, 255, 0.05)',
      'rgba(220, 225, 255, 0.07)',
      'rgba(214, 84, 255, 0.05)'
    ],
    coreStops: [
      'rgba(0, 220, 255, 0.09)',
      'rgba(255,255,255,0.07)',
      'rgba(214, 84, 255, 0.09)'
    ],

    particleLeft: [0, 220, 255],
    particleMid: [176, 180, 255],
    particleRight: [214, 84, 255],

    haloBase: 0.015,
    haloDepth: 0.03,
    haloBreath: 0.012,

    mistTop: 'rgba(255,255,255,0.015)',
    mistBottom: 'rgba(0,0,0,0.09)'
  },
    light: {
    baseBg: '#f8fafc',
    bgStops: ['#f8fafc', '#e9f1fb', '#f3f6fb'],

    leftGlow: '56, 149, 255',
    midGlow: '132, 110, 255',
    rightGlow: '220, 150, 48',

    leftGlowAlphaBase: 0.13,
    leftGlowAlphaBreath: 0.05,
    rightGlowAlphaBase: 0.12,
    rightGlowAlphaBreath: 0.045,

    ribbonStops: [
        'rgba(56, 149, 255, 0.14)',
        'rgba(132, 110, 255, 0.16)',
        'rgba(220, 150, 48, 0.14)'
    ],
    coreStops: [
        'rgba(56, 149, 255, 0.22)',
        'rgba(255,255,255,0.12)',
        'rgba(220, 150, 48, 0.22)'
    ],

    particleLeft: [56, 149, 255],
    particleMid: [132, 110, 255],
    particleRight: [220, 150, 48],

    haloBase: 0.05,
    haloDepth: 0.05,
    haloBreath: 0.02,

    mistTop: 'rgba(255,255,255,0.16)',
    mistBottom: 'rgba(148,163,184,0.06)'
    }
}

function theme() {
  return THEMES[props.mode] || THEMES.dark
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  width = window.innerWidth
  height = window.innerHeight

  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx = canvas.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
}

function createParticles() {
  particles = Array.from({ length: CONFIG.particleCount }, (_, i) => {
    const t = i / CONFIG.particleCount
    const depth = Math.random()

    return {
      baseT: t,
      baseX:
        width *
          (CONFIG.ribbonStartX +
            t * (CONFIG.ribbonEndX - CONFIG.ribbonStartX)) +
        rand(-80, 80),
      baseY: height * 0.52 + rand(-140, 140),

      x:
        width *
          (CONFIG.ribbonStartX +
            t * (CONFIG.ribbonEndX - CONFIG.ribbonStartX)) +
        rand(-100, 100),
      y: height * 0.52 + rand(-150, 150),

      vx: rand(-0.08, 0.08),
      vy: rand(-0.08, 0.08),

      phase: Math.random() * Math.PI * 2,
      depth,
      size: depth > 0.75 ? rand(1.8, 3.6) : rand(0.7, 2.2),
      alpha: depth > 0.75 ? rand(0.72, 0.95) : rand(0.2, 0.68)
    }
  })
}

function getColorByX(x, alpha = 1) {
  const t = theme()
  const ratio = x / width
  let rgb

  if (ratio < 0.33) rgb = t.particleLeft
  else if (ratio < 0.66) rgb = t.particleMid
  else rgb = t.particleRight

  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

function drawBackground() {
  const t = theme()

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, t.bgStops[0])
  bg.addColorStop(0.45, t.bgStops[1])
  bg.addColorStop(1, t.bgStops[2])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const breathe = 0.5 + 0.5 * Math.sin(time * 0.85)

  const glowLeft = ctx.createRadialGradient(
    width * 0.26,
    height * 0.5,
    0,
    width * 0.26,
    height * 0.5,
    width * 0.25
  )
  glowLeft.addColorStop(
    0,
    `rgba(${t.leftGlow}, ${t.leftGlowAlphaBase + breathe * t.leftGlowAlphaBreath})`
  )
  glowLeft.addColorStop(1, `rgba(${t.leftGlow}, 0)`)
  ctx.fillStyle = glowLeft
  ctx.fillRect(0, 0, width, height)

  const glowRight = ctx.createRadialGradient(
    width * 0.74,
    height * 0.5,
    0,
    width * 0.74,
    height * 0.5,
    width * 0.28
  )
  glowRight.addColorStop(
    0,
    `rgba(${t.rightGlow}, ${t.rightGlowAlphaBase + breathe * t.rightGlowAlphaBreath})`
  )
  glowRight.addColorStop(1, `rgba(${t.rightGlow}, 0)`)
  ctx.fillStyle = glowRight
  ctx.fillRect(0, 0, width, height)
}

function drawRibbon() {
  const t = theme()
  const breathe = 0.5 + 0.5 * Math.sin(time * 1.1)
  // 改起伏
  const amplitude = 32 + breathe * 18
  const thickness = 68 + breathe * 20

  const band = ctx.createLinearGradient(width * 0.15, 0, width * 0.85, 0)
  band.addColorStop(0, t.ribbonStops[0])
  band.addColorStop(0.5, t.ribbonStops[1])
  band.addColorStop(1, t.ribbonStops[2])

  ctx.beginPath()
  let started = false

// 大背景带

  for (let x = width * 0; x <= width * 1; x += 8) {
    const nx = x / width
    const fold = Math.sin(nx * 8 - time * 0.9) * 14
    const y = height * 0.5 + Math.sin(x * 0.01 + time * 1.7) * amplitude + fold
    if (!started) {
      ctx.moveTo(x, y)
      started = true
    } else {
      ctx.lineTo(x, y)
    }
  }

  for (let x = width * 1; x >= width * 0; x -= 8) {
    const nx = x / width
    const fold = Math.sin(nx * 8 - time * 0.9) * 14
    const y =
      height * 0.5 +
      Math.sin(x * 0.01 + time * 1.7 + 1.15) * amplitude +
      fold +
      thickness
    ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fillStyle = band
  ctx.fill()

  const core = ctx.createLinearGradient(width * 0.14, 0, width * 0.86, 0)
  core.addColorStop(0, t.coreStops[0])
  core.addColorStop(0.5, t.coreStops[1])
  core.addColorStop(1, t.coreStops[2])

  ctx.beginPath()
  started = false

  // 中间亮线
  for (let x = width * 0; x <= width * 1; x += 10) {
    const twist = Math.sin(x * 0.012 + time * 1.8) * (amplitude * 0.52)
    const y = height * 0.53 + twist
    if (!started) {
      ctx.moveTo(x, y)
      started = true
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.lineWidth = 14 + breathe * 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = core
  ctx.stroke()
}

function updateMouse() {
  mouse.x += (mouse.tx - mouse.x) * 0.08
  mouse.y += (mouse.ty - mouse.y) * 0.08
}

function updateParticles() {
  time += 0.01
  updateMouse()

  for (const p of particles) {
    const foldX = Math.sin(time * (1.1 + p.depth * 0.9) + p.phase) * (14 + p.depth * 22)
    const foldY = Math.cos(time * (1.55 + p.depth * 0.7) + p.phase) * (18 + p.depth * 28)

    const ribbonWave =
      Math.sin((p.baseX / width) * Math.PI * 3.2 + time * 1.45 + p.phase) * 26

    let mouseForceX = 0
    let mouseForceY = 0

    if (mouse.active) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 180

      if (dist < radius && dist > 0.1) {
        const force = (1 - dist / radius) * (0.8 + p.depth * 0.9)
        mouseForceX = -(dx / dist) * force * 7
        mouseForceY = -(dy / dist) * force * 7
      }
    }

    const depthPull = 0.014 + p.depth * 0.02

    p.x += p.vx + mouseForceX + (p.baseX + foldX - p.x) * depthPull
    p.y +=
      p.vy +
      mouseForceY +
      (p.baseY + foldY + ribbonWave * 0.34 - p.y) * depthPull
  }
}

function drawLinks() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]

      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < CONFIG.linkDistance) {
        const depthFactor = (a.depth + b.depth) / 2
        const alpha = (1 - dist / CONFIG.linkDistance) * (0.05 + depthFactor * 0.25)

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        grad.addColorStop(0, getColorByX(a.x, alpha))
        grad.addColorStop(1, getColorByX(b.x, alpha))

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineWidth = 0.5 + depthFactor * 1.1
        ctx.strokeStyle = grad
        ctx.stroke()
      }
    }
  }
}

function drawParticles() {
  const t = theme()
  const breathe = 0.5 + 0.5 * Math.sin(time * 1.25)

  for (const p of particles) {
    const pulse = 1 + Math.sin(time * 2.1 + p.phase) * 0.08
    const size = p.size * pulse

    ctx.beginPath()
    ctx.arc(p.x, p.y, size * (2.3 + p.depth * 1.3), 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${t.haloBase + p.depth * t.haloDepth + breathe * t.haloBreath})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
    ctx.fillStyle = getColorByX(p.x, p.alpha)
    ctx.fill()
  }
}

function drawDepthMist() {
  const t = theme()
  const mist = ctx.createLinearGradient(0, 0, 0, height)
  mist.addColorStop(0, t.mistTop)
  mist.addColorStop(0.3, 'rgba(255,255,255,0)')
  mist.addColorStop(0.7, 'rgba(255,255,255,0)')
  mist.addColorStop(1, t.mistBottom)
  ctx.fillStyle = mist
  ctx.fillRect(0, 0, width, height)
}

function animate() {
  if (!ctx) return

  drawBackground()
  drawRibbon()
  updateParticles()
  drawLinks()
  drawParticles()
  drawDepthMist()

  animationId = requestAnimationFrame(animate)
}

function handleResize() {
  resizeCanvas()
  createParticles()
}

function handleMouseMove(e) {
  mouse.tx = e.clientX
  mouse.ty = e.clientY
  mouse.active = true
}

function handleMouseLeave() {
  mouse.active = false
  mouse.tx = width * 0.5
  mouse.ty = height * 0.5
}

onMounted(() => {
  resizeCanvas()
  createParticles()

  mouse.x = width * 0.5
  mouse.y = height * 0.5
  mouse.tx = width * 0.5
  mouse.ty = height * 0.5

  animate()

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)

  if (animationId) cancelAnimationFrame(animationId)
})

watch(
  () => props.mode,
  () => {
    createParticles()
  }
)
</script>

<style scoped>
.network-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}
</style>
