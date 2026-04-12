<template>
  <main ref="pageRef" class="project-view" :class="`theme-${themeMode}`">
    <section class="project-shell">

      <section class="project-console" aria-label="检测演示台">
        <aside class="project-side">
          <div class="project-side__block">
            <p class="project-kicker">输入图像</p>
            <button class="project-btn project-btn--accent" type="button" @click="openFileDialog">
              上传测试图片
            </button>
            <button
              class="project-btn project-btn--ghost"
              type="button"
              :disabled="!userImageUrl"
              @click="resetToDemoScene"
            >
              恢复默认演示图
            </button>
            <input
              ref="fileInputRef"
              class="project-file"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />
          </div>

          <div class="project-side__block">
            <div class="project-side__row">
              <p class="project-kicker">场景模板</p>
              <span class="project-mini">{{ currentPreset.weather }}</span>
            </div>
            <div class="project-preset-list">
              <button
                v-for="preset in scenePresets"
                :key="preset.id"
                class="project-preset"
                :class="{ 'is-active': preset.id === selectedPresetId }"
                type="button"
                @click="selectedPresetId = preset.id"
              >
                <strong>{{ preset.label }}</strong>
                <span>{{ preset.description }}</span>
              </button>
            </div>
          </div>

          <div class="project-side__block">
            <div class="project-side__row">
              <p class="project-kicker">置信度阈值</p>
              <span class="project-mini">{{ thresholdPercent }}</span>
            </div>
            <input
              v-model="confidenceThreshold"
              class="project-slider"
              type="range"
              min="0.35"
              max="0.95"
              step="0.01"
            />
            <button class="project-btn project-btn--launch" type="button" :disabled="isRunning" @click="runDetection">
              {{ isRunning ? '模拟推理中...' : '运行模拟检测' }}
            </button>
            <p class="project-note">{{ statusText }}</p>
          </div>
        </aside>

        <section class="project-stage">
          <header class="project-stage__header">
            <div>
              <p class="project-kicker">可视化输出</p>
              <h2>{{ currentPreset.label }}</h2>
            </div>
            <div class="project-stage__meta">
              <span>{{ currentPreset.mode }}</span>
              <span>{{ currentPreset.fusion }}</span>
              <span>{{ inputSourceLabel }}</span>
            </div>
          </header>

          <div class="project-stage__viewer" :class="{ 'is-running': isRunning }">
            <img class="project-stage__image" :src="activeImageSrc" :alt="activeImageAlt" />
            <div class="project-stage__grid" aria-hidden="true"></div>
            <div v-if="isRunning" class="project-stage__scan" aria-hidden="true"></div>

            <div v-if="visibleDetections.length && hasRun" class="project-overlay">
              <button
                v-for="item in visibleDetections"
                :key="item.id"
                class="project-box"
                :class="{ 'is-active': item.id === activeDetectionId }"
                :style="boxStyle(item)"
                type="button"
                @mouseenter="activeDetectionId = item.id"
                @focus="activeDetectionId = item.id"
                @click="activeDetectionId = item.id"
              >
                <span class="project-box__tag">
                  {{ item.label }}
                  <strong>{{ scoreLabel(item.score) }}</strong>
                </span>
              </button>
            </div>

            <div v-if="!hasRun && !isRunning" class="project-stage__hint">
              <p>演示图已就绪</p>
              <span>点击“运行模拟检测”查看检测框、类别和置信度</span>
            </div>
          </div>

          <footer class="project-stage__footer">
            <div>
              <span>输入源</span>
              <strong>{{ inputSourceLabel }}</strong>
            </div>
            <div>
              <span>场景属性</span>
              <strong>{{ currentPreset.weather }}</strong>
            </div>
            <div>
              <span>推理状态</span>
              <strong>{{ hasRun ? '可视化结果已生成' : '等待推理触发' }}</strong>
            </div>
          </footer>
        </section>

        <aside class="project-results">
          <header>
            <p class="project-kicker">推理摘要</p>
            <h2>检测结果面板</h2>
          </header>

          <dl class="project-metrics">
            <div>
              <dt>输出目标</dt>
              <dd>{{ visibleDetections.length }}</dd>
            </div>
            <div>
              <dt>平均置信度</dt>
              <dd>{{ averageConfidence }}</dd>
            </div>
            <div>
              <dt>模拟时延</dt>
              <dd>{{ currentPreset.latency }}</dd>
            </div>
          </dl>

          <div class="project-summary">
            <p>{{ summaryTitle }}</p>
            <span>{{ summaryText }}</span>
          </div>

          <div v-if="visibleDetections.length && hasRun" class="project-list">
            <button
              v-for="item in visibleDetections"
              :key="item.id"
              class="project-list__item"
              :class="{ 'is-active': item.id === activeDetectionId }"
              type="button"
              @mouseenter="activeDetectionId = item.id"
              @focus="activeDetectionId = item.id"
              @click="activeDetectionId = item.id"
            >
              <div class="project-list__top">
                <strong>{{ item.label }}</strong>
                <span>{{ scoreLabel(item.score) }}</span>
              </div>
              <p>{{ item.channel }}</p>
              <small>{{ item.note }}</small>
            </button>
          </div>

          <div v-else class="project-empty">
            <p>{{ hasRun ? '当前阈值下没有可见结果。' : '结果列表尚未生成。' }}</p>
            <span>{{ hasRun ? '请降低阈值或切换场景模板。' : '上传图片或直接使用默认演示图后运行模拟检测。' }}</span>
          </div>
        </aside>
      </section>

    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

const injectedTheme = inject('argusTheme', ref(true))
const themeMode = computed(() => (injectedTheme.value ? 'dark' : 'light'))

const pageRef = ref(null)
const fileInputRef = ref(null)
const userImageUrl = ref('')
const uploadedFileName = ref('')
const selectedPresetId = ref('rain-crossing')
const confidenceThreshold = ref(0.54)
const isRunning = ref(false)
const hasRun = ref(false)
const runResults = ref([])
const activeDetectionId = ref('')

let timeoutHandle = null
let context = null

function createSceneSvg(config) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${config.skyTop}" />
          <stop offset="100%" stop-color="${config.skyBottom}" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${config.roadA}" />
          <stop offset="100%" stop-color="${config.roadB}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="42%" r="54%">
          <stop offset="0%" stop-color="${config.glow}" stop-opacity="0.88" />
          <stop offset="100%" stop-color="${config.glow}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#bg)" />
      <rect width="1600" height="1000" fill="url(#glow)" />
      <path d="M-120 728 L548 248 L806 370 L144 882 Z" fill="url(#road)" opacity="0.94" />
      <path d="M742 320 L1720 672 L1524 862 L600 470 Z" fill="url(#road)" opacity="0.84" />
      <path d="M524 232 L592 198 L1520 542 L1452 576 Z" fill="${config.lane}" opacity="0.58" />
      <path d="M118 744 L190 694 L770 352 L698 404 Z" fill="${config.lane}" opacity="0.52" />
      <g opacity="0.48" stroke="${config.grid}" stroke-width="1">
        <path d="M0 180 H1600" />
        <path d="M0 340 H1600" />
        <path d="M0 500 H1600" />
        <path d="M0 660 H1600" />
        <path d="M0 820 H1600" />
        <path d="M220 0 V1000" />
        <path d="M500 0 V1000" />
        <path d="M780 0 V1000" />
        <path d="M1060 0 V1000" />
        <path d="M1340 0 V1000" />
      </g>
      <g fill="${config.marker}">
        <rect x="322" y="620" width="78" height="32" rx="7" />
        <rect x="830" y="442" width="62" height="28" rx="7" opacity="0.84" />
        <rect x="1054" y="544" width="82" height="34" rx="7" />
        <rect x="614" y="532" width="22" height="38" rx="9" opacity="0.86" />
        <rect x="1218" y="634" width="24" height="44" rx="10" opacity="0.82" />
      </g>
      <text x="94" y="124" fill="${config.text}" font-size="44" font-family="Georgia, serif" letter-spacing="2">${config.title}</text>
      <text x="96" y="176" fill="${config.subtle}" font-size="20" font-family="Arial, sans-serif" letter-spacing="3">ARGUS DRONE DEMO</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const scenePresets = [
  {
    id: 'rain-crossing',
    label: '雨雾路口',
    description: '低可见度交叉路口中的小目标恢复。',
    mode: '无人机高位俯视',
    weather: '雨雾',
    fusion: 'RGB / Thermal / Prior',
    latency: '148 ms',
    imageSrc: createSceneSvg({
      title: 'Rain Crossing',
      skyTop: '#07111f',
      skyBottom: '#17263d',
      roadA: '#243246',
      roadB: '#0d1420',
      glow: '#b58f63',
      lane: '#ceb58b',
      grid: 'rgba(190,172,138,0.22)',
      marker: '#d9b472',
      text: '#f5eee0',
      subtle: '#ccb793',
    }),
    detections: [
      { id: 'rc-1', label: '小汽车', score: 0.94, left: 18.2, top: 59.8, width: 10.8, height: 7.9, color: '#d9b472', channel: 'RGB + 热成像线索', note: '雨幕遮挡下保持稳定边界。' },
      { id: 'rc-2', label: '行人', score: 0.81, left: 37.8, top: 52.2, width: 4.2, height: 8.8, color: '#97d5c7', channel: '热成像增强', note: '弱目标示意输出。' },
      { id: 'rc-3', label: '货车', score: 0.9, left: 63.5, top: 45.6, width: 12.6, height: 9.3, color: '#8fb0ff', channel: 'RGB + 结构先验', note: '受雾霾影响较大仍可检测。' },
      { id: 'rc-4', label: '骑行者', score: 0.76, left: 77.8, top: 62.4, width: 4.6, height: 9.5, color: '#f2a6b3', channel: '多模态融合', note: '复杂路口中的小目标类别。' },
    ],
  },
  {
    id: 'night-arterial',
    label: '夜间主干道',
    description: '夜间逆光与车灯干扰下的检测演示。',
    mode: '无人机斜俯视',
    weather: '夜间 / 眩光',
    fusion: 'RGB / Thermal',
    latency: '131 ms',
    imageSrc: createSceneSvg({
      title: 'Night Arterial',
      skyTop: '#050811',
      skyBottom: '#121826',
      roadA: '#293347',
      roadB: '#111722',
      glow: '#8f7453',
      lane: '#d8b88c',
      grid: 'rgba(189,170,132,0.18)',
      marker: '#f2c982',
      text: '#f7efe1',
      subtle: '#baa789',
    }),
    detections: [
      { id: 'na-1', label: '公交车', score: 0.93, left: 21.4, top: 58.4, width: 13.4, height: 8.8, color: '#d9b472', channel: 'RGB + 热成像线索', note: '夜间车灯干扰下的稳定输出。' },
      { id: 'na-2', label: '小汽车', score: 0.87, left: 49.7, top: 49.8, width: 8.4, height: 6.7, color: '#8fb0ff', channel: 'RGB 通道', note: '逆光区域模板结果。' },
      { id: 'na-3', label: '行人', score: 0.72, left: 69.1, top: 64.7, width: 3.8, height: 8.6, color: '#97d5c7', channel: '热成像增强', note: '属于远距小目标。' },
    ],
  },
  {
    id: 'bridge-backlight',
    label: '逆光高架',
    description: '高反差桥面中的远距目标检测。',
    mode: '无人机远距航拍',
    weather: '逆光 / 薄雾',
    fusion: 'RGB / Thermal / Geometry',
    latency: '156 ms',
    imageSrc: createSceneSvg({
      title: 'Backlight Bridge',
      skyTop: '#0f1727',
      skyBottom: '#202838',
      roadA: '#314259',
      roadB: '#182030',
      glow: '#d0a66d',
      lane: '#e0c394',
      grid: 'rgba(202,183,144,0.18)',
      marker: '#f0cb8a',
      text: '#fcf3e4',
      subtle: '#ccb28d',
    }),
    detections: [
      { id: 'bb-1', label: '小汽车', score: 0.89, left: 16.6, top: 61.2, width: 8.9, height: 6.6, color: '#d9b472', channel: 'RGB + 几何先验', note: '桥面逆光条件下的远距车辆。' },
      { id: 'bb-2', label: '工程车', score: 0.85, left: 56.4, top: 46.3, width: 11.8, height: 8.2, color: '#8fb0ff', channel: '多模态融合', note: '高亮背景中的结构稳定输出。' },
      { id: 'bb-3', label: '行人', score: 0.68, left: 74.8, top: 63.7, width: 3.2, height: 8.1, color: '#97d5c7', channel: '热成像增强', note: '阈值较高时会自动被过滤。' },
      { id: 'bb-4', label: '摩托车', score: 0.74, left: 34.2, top: 54.5, width: 5.1, height: 6.8, color: '#f2a6b3', channel: 'RGB + 热成像线索', note: '小尺寸目标示意结果。' },
    ],
  },
]

const currentPreset = computed(() => scenePresets.find((item) => item.id === selectedPresetId.value) ?? scenePresets[0])
const activeImageSrc = computed(() => userImageUrl.value || currentPreset.value.imageSrc)
const activeImageAlt = computed(() => (userImageUrl.value ? `用户上传测试图：${uploadedFileName.value}` : `${currentPreset.value.label} 默认演示图`))
const inputSourceLabel = computed(() => (userImageUrl.value ? `上传图像：${uploadedFileName.value}` : `默认图像：${currentPreset.value.label}`))
const visibleDetections = computed(() => runResults.value.filter((item) => item.score >= Number(confidenceThreshold.value)))
const thresholdPercent = computed(() => `${Math.round(Number(confidenceThreshold.value) * 100)}%`)
const averageConfidence = computed(() => {
  if (!visibleDetections.value.length) return '--'
  const avg = visibleDetections.value.reduce((total, item) => total + item.score, 0) / visibleDetections.value.length
  return `${Math.round(avg * 100)}%`
})
const statusText = computed(() => {
  if (isRunning.value) return '正在调用前端模拟推理服务，并生成检测可视化结果。'
  if (hasRun.value) return `已完成 ${currentPreset.value.label} 场景的演示推理，可继续切换阈值查看结果。`
  return '等待输入图像与推理指令。'
})
const summaryTitle = computed(() => {
  if (isRunning.value) return '演示引擎正在生成结果。'
  if (!hasRun.value) return '尚未输出检测结果。'
  return `已输出 ${visibleDetections.value.length} 个目标候选。`
})
const summaryText = computed(() => {
  if (isRunning.value) return '正在推理'
  if (!hasRun.value) return '上传测试图或直接使用默认演示图后，点击运行即可查看检测框、类别与置信度。'
  if (!visibleDetections.value.length) return '当前阈值过滤掉了全部结果，请适当降低阈值。'
  return '结果列表与叠加框同步联动，鼠标移入任一结果即可高亮对应目标。'
})

watch(selectedPresetId, () => clearRun())
watch(visibleDetections, (items) => {
  if (!items.length) {
    activeDetectionId.value = ''
    return
  }
  if (!items.some((item) => item.id === activeDetectionId.value)) {
    activeDetectionId.value = items[0].id
  }
})

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (userImageUrl.value) URL.revokeObjectURL(userImageUrl.value)
  userImageUrl.value = URL.createObjectURL(file)
  uploadedFileName.value = file.name
  clearRun()
}

function resetToDemoScene() {
  if (userImageUrl.value) URL.revokeObjectURL(userImageUrl.value)
  userImageUrl.value = ''
  uploadedFileName.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  clearRun()
}

function clearRun() {
  if (timeoutHandle) {
    window.clearTimeout(timeoutHandle)
    timeoutHandle = null
  }
  isRunning.value = false
  hasRun.value = false
  runResults.value = []
  activeDetectionId.value = ''
}

function runDetection() {
  clearRun()
  isRunning.value = true
  timeoutHandle = window.setTimeout(() => {
    runResults.value = currentPreset.value.detections.map((item) => ({ ...item }))
    hasRun.value = true
    isRunning.value = false
    activeDetectionId.value = runResults.value[0]?.id ?? ''
    timeoutHandle = null
  }, 1150)
}

function scoreLabel(score) {
  return `${Math.round(score * 100)}%`
}

function boxStyle(item) {
  return {
    left: `${item.left}%`,
    top: `${item.top}%`,
    width: `${item.width}%`,
    height: `${item.height}%`,
    '--box-tone': item.color,
  }
}

onMounted(() => {
  if (!pageRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  context = gsap.context(() => {
    const hero = pageRef.value.querySelector('.project-hero')
    const consoleNode = pageRef.value.querySelector('.project-console')
    const footnotes = pageRef.value.querySelectorAll('.project-footnotes article')
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(hero, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.82 })
      .fromTo(consoleNode, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.14)
      .fromTo(footnotes, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.08 }, 0.34)
  }, pageRef)
})

onBeforeUnmount(() => {
  if (timeoutHandle) window.clearTimeout(timeoutHandle)
  if (userImageUrl.value) URL.revokeObjectURL(userImageUrl.value)
  context?.revert()
})
</script>

<style scoped>
.project-view {
  --project-title: #f4ede1;
  --project-copy: rgba(225, 221, 213, 0.84);
  --project-copy-soft: rgba(193, 187, 177, 0.76);
  --project-kicker: rgba(215, 181, 116, 0.88);
  --project-accent: #d7b574;
  --project-accent-deep: #8f6942;
  --project-line: rgba(207, 178, 121, 0.14);
  --project-line-strong: rgba(207, 178, 121, 0.26);
  --project-divider: rgba(207, 178, 121, 0.1);
  --project-surface: rgba(10, 15, 23, 0.8);
  --project-stage: rgba(7, 11, 17, 0.72);
  --project-shadow: rgba(0, 0, 0, 0.24);
  --project-grid: rgba(255, 255, 255, 0.05);
  --project-scan: rgba(215, 181, 116, 0.24);
  min-height: calc(100vh - 56px);
  padding: 36px 24px 88px;
  color: var(--project-title);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
}

.theme-light.project-view {
  --project-title: #1f2530;
  --project-copy: rgba(48, 53, 61, 0.84);
  --project-copy-soft: rgba(88, 89, 88, 0.76);
  --project-kicker: rgba(164, 120, 52, 0.92);
  --project-accent: #c89b57;
  --project-accent-deep: #9a6a3b;
  --project-line: rgba(165, 125, 60, 0.16);
  --project-line-strong: rgba(165, 125, 60, 0.28);
  --project-divider: rgba(165, 125, 60, 0.12);
  --project-surface: rgba(255, 252, 246, 0.88);
  --project-stage: rgba(251, 247, 239, 0.88);
  --project-shadow: rgba(65, 54, 37, 0.09);
  --project-grid: rgba(60, 49, 33, 0.06);
  --project-scan: rgba(194, 142, 67, 0.18);
}

.project-shell {
  max-width: 1380px;
  margin: 0 auto;
  display: grid;
  gap: clamp(2.5rem, 5vw, 4.75rem);
}

.project-kicker {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--project-kicker);
}

.project-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.72fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: end;
}

.project-hero__title,
.project-stage h2,
.project-results h2,
.project-footnotes h3 {
  margin: 0;
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-weight: 500;
}

.project-hero__title {
  max-width: 10ch;
  margin-top: 0.45rem;
  font-size: clamp(3.2rem, 5.8vw, 5.5rem);
  line-height: 1.08;
  letter-spacing: 0.01em;
  text-wrap: balance;
}

.project-hero__aside {
  display: grid;
  gap: 1.25rem;
}

.project-hero__body,
.project-note,
.project-summary span,
.project-list p,
.project-list small,
.project-empty span,
.project-footnotes p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--project-copy-soft);
  text-wrap: pretty;
}

.project-hero__tags,
.project-stage__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-hero__tags span,
.project-stage__meta span {
  padding: 8px 12px;
  border: 1px solid var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 84%, transparent);
  color: var(--project-copy);
  font-size: var(--argus-type-meta);
}

.project-console {
  display: grid;
  grid-template-columns: 316px minmax(0, 1fr) 330px;
  border: 1px solid var(--project-line);
  background: linear-gradient(180deg, color-mix(in srgb, var(--project-surface) 96%, transparent), var(--project-surface));
  box-shadow: 0 34px 90px var(--project-shadow);
  overflow: hidden;
}

.project-side,
.project-stage,
.project-results {
  min-width: 0;
}

.project-side {
  display: grid;
  gap: 1px;
  background: var(--project-divider);
}

.project-side__block {
  display: grid;
  gap: 14px;
  padding: 24px;
  background: var(--project-surface);
}

.project-side__row,
.project-list__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.project-mini {
  color: var(--project-copy);
  font-size: var(--argus-type-meta);
}

.project-file {
  display: none;
}

.project-btn,
.project-preset,
.project-box,
.project-list__item {
  appearance: none;
  border: none;
  font: inherit;
}

.project-btn,
.project-preset,
.project-list__item {
  cursor: pointer;
  transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, opacity 0.22s ease;
}

.project-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.project-btn:not(:disabled):hover,
.project-preset:hover,
.project-list__item:hover {
  transform: translateY(-1px);
}

.project-btn {
  min-height: 48px;
  padding: 0 18px;
}

.project-btn--accent {
  color: #101724;
  background: linear-gradient(135deg, var(--project-accent), var(--project-accent-deep));
}

.project-btn--ghost,
.project-btn--launch,
.project-preset {
  border: 1px solid var(--project-line);
  background: transparent;
  color: var(--project-copy);
}

.project-preset-list {
  display: grid;
  gap: 10px;
}

.project-preset {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  text-align: left;
}

.project-preset.is-active {
  border-color: var(--project-line-strong);
  background: color-mix(in srgb, var(--project-surface) 76%, transparent);
}

.project-preset strong {
  color: var(--project-title);
  font-size: 1rem;
}

.project-preset span {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
  line-height: 1.6;
}

.project-slider {
  width: 100%;
  accent-color: var(--project-accent);
}

.project-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border-left: 1px solid var(--project-divider);
  border-right: 1px solid var(--project-divider);
  background: var(--project-stage);
}

.project-stage__header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 26px 28px 20px;
  border-bottom: 1px solid var(--project-divider);
}

.project-stage h2,
.project-results h2 {
  margin-top: 6px;
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  line-height: 1.2;
}

.project-stage__viewer {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  background: linear-gradient(180deg, color-mix(in srgb, var(--project-stage) 90%, #000), color-mix(in srgb, var(--project-stage) 78%, #000));
}

.project-stage__image,
.project-overlay {
  position: absolute;
  inset: 0;
}

.project-stage__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-stage__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--project-grid) 1px, transparent 1px), linear-gradient(90deg, var(--project-grid) 1px, transparent 1px);
  background-size: 72px 72px;
  pointer-events: none;
}

.project-stage__scan {
  position: absolute;
  inset: -10% 0 auto;
  height: 28%;
  background: linear-gradient(180deg, transparent, var(--project-scan), transparent);
  mix-blend-mode: screen;
  animation: scan 1.15s ease-in-out infinite;
}

.project-overlay {
  pointer-events: none;
}

.project-box {
  position: absolute;
  border: 1px solid var(--box-tone);
  background: color-mix(in srgb, var(--box-tone) 12%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--box-tone) 28%, transparent);
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.project-box:hover,
.project-box.is-active {
  transform: scale(1.01);
  background: color-mix(in srgb, var(--box-tone) 18%, transparent);
}

.project-box__tag {
  position: absolute;
  left: -1px;
  top: -32px;
  display: inline-flex;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(8, 12, 18, 0.9);
  color: #fff7ea;
  font-size: 0.74rem;
  white-space: nowrap;
}

.theme-light .project-box__tag {
  background: rgba(255, 250, 242, 0.94);
  color: #231e16;
}

.project-stage__hint {
  position: absolute;
  left: 28px;
  bottom: 24px;
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 86%, transparent);
  backdrop-filter: blur(10px);
}

.project-stage__hint p,
.project-stage__hint span {
  margin: 0;
}

.project-stage__hint span {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
}

.project-stage__footer {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--project-divider);
}

.project-stage__footer div {
  display: grid;
  gap: 4px;
  padding: 18px 22px;
}

.project-stage__footer div + div {
  border-left: 1px solid var(--project-divider);
}

.project-stage__footer span {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
}

.project-stage__footer strong {
  color: var(--project-copy);
  font-size: 0.95rem;
}

.project-results {
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 22px;
  padding: 26px 24px 24px;
  background: var(--project-surface);
}

.project-metrics {
  display: grid;
  gap: 1px;
  margin: 0;
  background: var(--project-divider);
}

.project-metrics div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 14px 0;
  background: var(--project-surface);
}

.project-metrics dt {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
}

.project-metrics dd {
  margin: 0;
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-size: 1.4rem;
  color: var(--project-title);
}

.project-summary {
  display: grid;
  gap: 8px;
  padding-top: 2px;
}

.project-summary p,
.project-empty p {
  margin: 0;
  color: var(--project-copy);
  font-size: 0.98rem;
  line-height: 1.55;
}

.project-list {
  display: grid;
  gap: 1px;
  background: var(--project-divider);
  overflow: auto;
}

.project-list__item {
  display: grid;
  gap: 8px;
  padding: 16px 0;
  text-align: left;
  background: var(--project-surface);
}

.project-list__item.is-active {
  background: color-mix(in srgb, var(--project-surface) 82%, transparent);
}

.project-list__top strong {
  color: var(--project-title);
  font-size: 1rem;
}

.project-list__top span,
.project-list p {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
}

.project-empty {
  display: grid;
  gap: 8px;
}

.project-footnotes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--project-divider);
}

.project-footnotes article {
  display: grid;
  gap: 10px;
  padding: 24px;
  background: var(--project-surface);
}

.project-footnotes h3 {
  font-size: 1.35rem;
  line-height: 1.28;
}

@keyframes scan {
  0% { transform: translateY(-18%); }
  100% { transform: translateY(290%); }
}

@media (max-width: 1180px) {
  .project-console {
    grid-template-columns: 1fr;
  }

  .project-stage {
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--project-divider);
    border-bottom: 1px solid var(--project-divider);
  }
}

@media (max-width: 960px) {
  .project-hero {
    grid-template-columns: 1fr;
  }

  .project-hero__title {
    max-width: 12ch;
  }

  .project-stage__header {
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .project-view {
    padding: 22px 16px 48px;
  }

  .project-hero__title {
    max-width: none;
    font-size: clamp(2.5rem, 10vw, 3.6rem);
  }

  .project-stage__viewer {
    min-height: 420px;
  }

  .project-stage__footer,
  .project-footnotes {
    grid-template-columns: 1fr;
  }

  .project-stage__footer div + div {
    border-left: none;
    border-top: 1px solid var(--project-divider);
  }
}
</style>
