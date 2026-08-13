<template>
  <main ref="pageRef" class="project-view" :class="`theme-${themeMode}`">
    <section class="project-shell">
      <aside class="project-nav" aria-label="场景模板导航">
        <header class="project-nav__head">
          <p class="project-kicker">场景导航</p>
          <h1>场景模板</h1>
          <span>默认优先展示视频样例，点击左侧场景切换展示内容。</span>
        </header>

        <div class="project-nav__groups">
          <section v-for="group in groupedCategories" :key="group.key" class="project-nav-group">
            <button
              class="project-nav-group__trigger"
              :class="{ 'is-open': group.key === openCategoryKey }"
              type="button"
              :aria-expanded="group.key === openCategoryKey"
              :aria-controls="`category-panel-${group.key}`"
              @click="setOpenCategory(group.key)"
            >
              <span>{{ group.title }}</span>
              <div class="project-nav-group__meta">
                <strong>{{ group.scenes.length }}</strong>
                <i aria-hidden="true">{{ group.key === openCategoryKey ? '−' : '+' }}</i>
              </div>
            </button>

            <div
              v-show="group.key === openCategoryKey"
              :id="`category-panel-${group.key}`"
              class="project-nav-group__list"
            >
              <button
                v-for="scene in group.scenes"
                :key="scene.id"
                class="project-scene-button"
                :class="{ 'is-active': scene.id === selectedSceneId }"
                type="button"
                :aria-pressed="scene.id === selectedSceneId"
                @click="setSelectedScene(scene.id)"
              >
                <div class="project-scene-button__top">
                  <strong>{{ scene.title }}</strong>
                  <span v-if="scene.badge" class="project-scene-button__badge">
                    {{ scene.badge }}
                  </span>
                </div>
                <small>{{ compactTags(scene.tags) }}</small>
              </button>
            </div>
          </section>
        </div>
      </aside>

      <section class="project-stage" aria-label="检测演示主舞台">
        <header class="project-stage__head">
          <div class="project-stage__heading">
            <p class="project-kicker">演示主舞台</p>
            <div class="project-stage__title">
              <h2>{{ currentScene.title }}</h2>
              <p>{{ currentScene.summary }}</p>
            </div>
          </div>

          <div class="project-stage__control-panel">
            <div class="project-stage__browse" aria-label="场景顺序浏览">
              <button
                class="project-stage__browse-button"
                type="button"
                :disabled="!hasPreviousScene"
                @click="goToPreviousScene"
              >
                上一场景
              </button>
              <button
                class="project-stage__browse-button"
                type="button"
                :disabled="!hasNextScene"
                @click="goToNextScene"
              >
                下一场景
              </button>
            </div>

            <section class="project-toolbar" aria-label="视图切换控件">
              <div class="project-switcher">
                <span class="project-switcher__label">内容视图</span>
                <div
                  class="project-switcher__group"
                  role="tablist"
                  aria-label="内容视图"
                  @keydown="
                    handleSwitcherKeydown($event, availableViewOptions, activeView, setActiveView)
                  "
                >
                  <button
                    v-for="option in availableViewOptions"
                    :key="option.value"
                    class="project-switcher__button"
                    :class="{ 'is-active': activeView === option.value }"
                    type="button"
                    role="tab"
                    :id="`view-tab-${option.value}`"
                    :aria-selected="activeView === option.value"
                    aria-controls="project-stage-panel"
                    :tabindex="activeView === option.value ? 0 : -1"
                    @click="setActiveView(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="project-switcher">
                <span class="project-switcher__label">模态切换</span>
                <div
                  class="project-switcher__group"
                  role="tablist"
                  aria-label="模态切换"
                  @keydown="
                    handleSwitcherKeydown(
                      $event,
                      modalityOptions,
                      activeModality,
                      setActiveModality,
                    )
                  "
                >
                  <button
                    v-for="option in modalityOptions"
                    :key="option.value"
                    class="project-switcher__button"
                    :class="{ 'is-active': activeModality === option.value }"
                    type="button"
                    role="tab"
                    :id="`modality-tab-${option.value}`"
                    :aria-selected="activeModality === option.value"
                    aria-controls="project-stage-panel"
                    :tabindex="activeModality === option.value ? 0 : -1"
                    @click="setActiveModality(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </header>

        <div class="project-stage__body">
          <figure
            id="project-stage-panel"
            class="project-display"
            role="tabpanel"
            :aria-labelledby="`view-tab-${activeView}`"
          >
            <div
              class="project-display__frame"
              role="group"
              :aria-labelledby="`modality-tab-${activeModality}`"
            >
              <div class="project-display__chips">
                <span>{{ currentViewLabel }}</span>
                <span>{{ currentModalityLabel }}</span>
                <span v-if="isActiveVideo">自动播放视频</span>
                <span v-if="isAutoCycling" class="project-display__autoplay-chip">轮播预览中</span>
              </div>

              <template v-if="hasActiveMedia">
                <div
                  v-if="isMediaLoading"
                  class="project-display__loading"
                  role="status"
                  aria-live="polite"
                >
                  <span class="project-display__spinner" aria-hidden="true"></span>
                  <span>{{ mediaLoadingLabel }}</span>
                </div>
                <video
                  v-if="isActiveVideo"
                  :key="activeMediaSrc"
                  ref="activeVideoRef"
                  class="project-display__video"
                  :class="{ 'is-loaded': mediaLoaded }"
                  :src="activeMediaSrc"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="auto"
                  @loadstart="handleVideoLoadStart"
                  @canplay="handleVideoCanPlay"
                  @playing="handleVideoPlaying"
                  @waiting="handleVideoWaiting"
                  @stalled="handleVideoWaiting"
                  @error="handleMediaError"
                ></video>
                <img
                  v-else
                  class="project-display__image"
                  :class="{ 'is-loaded': mediaLoaded }"
                  :src="activeMediaSrc"
                  :alt="activeMediaAlt"
                  @load="handleMediaLoad"
                  @error="handleMediaError"
                />
              </template>

              <div v-else class="project-display__empty" role="status" aria-live="polite">
                <strong>当前媒体暂不可用</strong>
                <p>请切换其他场景、其他视图或其他模态继续查看演示内容。</p>
              </div>
            </div>

            <figcaption class="project-display__caption">
              {{ activeMediaCaption }}
            </figcaption>
          </figure>

          <aside class="project-cues" aria-label="讲解提要">
            <div v-for="item in cueItems" :key="item.label" class="project-cue">
              <span>{{ item.label }}</span>
              <p>{{ item.value }}</p>
            </div>
          </aside>
        </div>
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
const activeVideoRef = ref(null)
const mediaErrored = ref(false)
const mediaLoaded = ref(false)
const videoBuffering = ref(false)
const isAutoCycling = ref(false)
let context = null
let autoplayTimer = null
let bufferingTimer = null
let previewSessionToken = 0
let previewStepIndex = 0

const mediaModules = {
  ...import.meta.glob('../assets/imgs/*/*.jpg', {
    eager: true,
    import: 'default',
  }),
  ...import.meta.glob('../assets/imgs/*/*.mp4', {
    eager: true,
    import: 'default',
  }),
}

function resolveSceneMedia(folder, file) {
  return mediaModules[`../assets/imgs/${folder}/${file}`] ?? ''
}

const categoryDefinitions = [
  { key: 'complex-light', title: '复杂光照场景' },
  { key: 'occlusion-dense', title: '遮挡与密集场景' },
  { key: 'weather-hard', title: '恶劣天气场景' },
  { key: 'far-small', title: '远距小目标场景' },
]

const defaultAssetFiles = {
  rgb_original: 'rgb_original.jpg',
  x_original: 'x_original.jpg',
  rgb_prediction: 'rgb_prediction.jpg',
  x_prediction: 'x_prediction.jpg',
  rgb_gt: 'rgb_ground_truth.jpg',
  x_gt: 'x_ground_truth.jpg',
}

const sceneCatalog = [
  {
    id: '1',
    title: '遮挡路口',
    categoryKey: 'occlusion-dense',
    tags: ['夜间', '遮挡', '多目标'],
    summary: '夜间路口中的密集车辆与遮挡样例。',
    challenge: '车流拥挤，边界重叠，局部强光扰动明显。',
    targets: '以小汽车为主，包含密集近邻目标。',
    performance: '模型在遮挡区域仍能保持较稳定的主要目标覆盖。',
  },
  {
    id: '2',
    title: '夜间主干道',
    categoryKey: 'occlusion-dense',
    tags: ['夜间', '车灯干扰', '排队车流'],
    summary: '主干道夜间连续车流检测样例。',
    challenge: '车灯高亮与长队列分布同时存在，容易造成漏检。',
    targets: '以连续车流中的车辆目标为主。',
    performance: '对主干道连续车辆具有较好的整体覆盖能力。',
  },
  {
    id: '3',
    title: '强光道路',
    categoryKey: 'complex-light',
    tags: ['白天', '强光', '阴影干扰'],
    summary: '白天强光与阴影同时存在的道路样例。',
    challenge: '高亮路面与树影交错，目标边界容易被压缩。',
    targets: '包含公交车、小汽车等多类别目标。',
    performance: '在强光与阴影共存条件下仍保持较清晰的目标定位。',
  },
  {
    id: '4',
    title: '极低照度道路',
    categoryKey: 'complex-light',
    tags: ['夜间', '极低照度', '暗区'],
    summary: '局部照明下的大范围暗场检测样例。',
    challenge: '整体可见度低，暗区占比大，细节信息不足。',
    targets: '以暗区道路中的车辆目标为主。',
    performance: '红外视图能够明显补足低照度环境中的感知信息。',
  },
  {
    id: '5',
    title: '开阔路口远距车流',
    categoryKey: 'far-small',
    tags: ['白天', '远距目标', '尺度差异'],
    summary: '开阔视场中远距车辆分布样例。',
    challenge: '远近目标尺度差异明显，小目标易被背景淹没。',
    targets: '包含货车、小汽车等不同尺度车辆。',
    performance: '对大视场中的远距目标仍保持持续检出能力。',
  },
  {
    id: '6',
    title: '低照度城市道路',
    categoryKey: 'complex-light',
    tags: ['夜间', '低照度', '阴影遮挡'],
    summary: '夜间城市道路中的低照度样例。',
    challenge: '道路照明不均，阴影区域多，边缘目标较弱。',
    targets: '以分散分布的车辆目标为主。',
    performance: '对非密集分布场景也保持稳定的基础识别能力。',
  },
  {
    id: '7',
    title: '低能见度雾天',
    categoryKey: 'weather-hard',
    tags: ['雾天', '低能见度', '模糊退化'],
    summary: '雾霾退化条件下的恶劣天气样例。',
    challenge: '对比度低，远距目标模糊，边界信息衰减明显。',
    targets: '以远距模糊车辆目标为主。',
    performance: '在恶劣天气下仍保持可用的目标定位表现。',
  },
  {
    id: '8',
    title: '夜间远距主干道',
    categoryKey: 'far-small',
    tags: ['夜间', '小目标', '照明不均'],
    summary: '低照度主干道中的远距小目标样例。',
    challenge: '目标尺寸小且分布稀疏，照明不均影响稳定识别。',
    targets: '以远距弱目标和小尺寸车辆为主。',
    performance: '对夜间远距小目标具有较好的保持能力。',
  },
  {
    id: '9',
    title: '极暗背景小目标',
    categoryKey: 'complex-light',
    tags: ['极暗', '局部强光', '困难样例'],
    summary: '极暗背景中的小目标困难场景。',
    challenge: '全局亮度极低，局部强光形成强烈反差。',
    targets: '以极暗场景中的弱小目标为主。',
    performance: '能够体现模型对极端照明条件的适应能力。',
    isFeatured: true,
  },
  {
    id: '11',
    title: '夜间主干道视频',
    categoryKey: 'complex-light',
    tags: ['夜间', '低照度', '车灯干扰'],
    summary: '夜间城市主干道中的连续车流与多目标场景。',
    challenge: '局部强光、车灯干扰与明暗不均同时存在，排队车流连续出现。',
    targets: '以主干道车流中的多目标车辆为主，适合观察连续时序中的检测稳定性。',
    performance: '用于展示 RGB 与 IR 原始视频及对应推理结果的连续对照效果。',
    mediaType: 'video',
    badge: '视频',
    isFeatured: true,
    assetFiles: {
      rgb_original: 'rgb_original_stage.mp4',
      x_original: 'x_original_stage.mp4',
      rgb_prediction: 'rgb_prediction_stage.mp4',
      x_prediction: 'x_prediction_stage.mp4',
    },
  },
  {
    id: '10',
    title: '跨江大桥远距视频',
    categoryKey: 'far-small',
    tags: ['白天', '轻雾感', '远距车辆'],
    summary: '跨江大桥上的长距离道路与远距小目标车辆场景。',
    challenge: '低对比度与轻雾感并存，远距车辆沿长距离道路稀疏分布。',
    targets: '以远距车辆和长距离道路中的小目标为主，适合观察连续远距检出表现。',
    performance: '用于展示模型在低对比度远距场景下的连续检出稳定性。',
    mediaType: 'video',
    badge: '视频',
    assetFiles: {
      rgb_original: 'rgb_original_stage.mp4',
      x_original: 'x_original_stage.mp4',
      rgb_prediction: 'rgb_prediction_stage.mp4',
      x_prediction: 'x_prediction_stage.mp4',
    },
  },
  {
    id: '12',
    title: '高空俯视道路视频',
    categoryKey: 'far-small',
    tags: ['白天', '高空俯视', '分散车流'],
    summary: '高空俯视下的城市道路远距车流与多目标场景。',
    challenge: '目标尺寸小、分散度高，开阔背景容易稀释前景细节。',
    targets: '以分散车流中的远距车辆与多目标为主，适合观察高空俯视下的小目标表现。',
    performance: '用于展示原始输入与推理结果在高空俯视场景中的连续对比效果。',
    mediaType: 'video',
    badge: '视频',
    assetFiles: {
      rgb_original: 'rgb_original_stage.mp4',
      x_original: 'x_original_stage.mp4',
      rgb_prediction: 'rgb_prediction_stage.mp4',
      x_prediction: 'x_prediction_stage.mp4',
    },
  },
].map((scene) => ({
  ...scene,
  mediaType: scene.mediaType ?? 'image',
  availableViews:
    scene.mediaType === 'video' ? ['original', 'prediction'] : ['original', 'prediction', 'gt'],
  badge: scene.badge ?? (scene.isFeatured ? '推荐' : ''),
  assets: {
    rgb_original: resolveSceneMedia(
      scene.id,
      scene.assetFiles?.rgb_original ?? defaultAssetFiles.rgb_original,
    ),
    x_original: resolveSceneMedia(
      scene.id,
      scene.assetFiles?.x_original ?? defaultAssetFiles.x_original,
    ),
    rgb_prediction: resolveSceneMedia(
      scene.id,
      scene.assetFiles?.rgb_prediction ?? defaultAssetFiles.rgb_prediction,
    ),
    x_prediction: resolveSceneMedia(
      scene.id,
      scene.assetFiles?.x_prediction ?? defaultAssetFiles.x_prediction,
    ),
    rgb_gt: resolveSceneMedia(scene.id, scene.assetFiles?.rgb_gt ?? defaultAssetFiles.rgb_gt),
    x_gt: resolveSceneMedia(scene.id, scene.assetFiles?.x_gt ?? defaultAssetFiles.x_gt),
  },
}))

const viewOptions = [
  { value: 'original', label: '原始输入' },
  { value: 'prediction', label: '推理结果' },
  { value: 'gt', label: '标准答案' },
]

const modalityOptions = [
  { value: 'rgb', label: 'RGB' },
  { value: 'infrared', label: 'IR' },
]

const selectedSceneId = ref('11')
const activeView = ref('original')
const activeModality = ref('rgb')
const openCategoryKey = ref('complex-light')
// 每张图在轮播中的停留时间，单位毫秒。
const scenePreviewIntervalMs = 2000

const availableViewOptions = computed(() =>
  viewOptions.filter((option) => currentScene.value.availableViews.includes(option.value)),
)

const groupedCategories = computed(() =>
  categoryDefinitions.map((category) => ({
    ...category,
    scenes: sceneCatalog.filter((scene) => scene.categoryKey === category.key),
  })),
)

const currentScene = computed(
  () => sceneCatalog.find((scene) => scene.id === selectedSceneId.value) ?? sceneCatalog[0],
)

const currentSceneIndex = computed(() =>
  sceneCatalog.findIndex((scene) => scene.id === selectedSceneId.value),
)

const hasPreviousScene = computed(() => currentSceneIndex.value > 0)
const hasNextScene = computed(() => currentSceneIndex.value < sceneCatalog.length - 1)

const currentCategory = computed(
  () =>
    categoryDefinitions.find((category) => category.key === currentScene.value.categoryKey) ??
    categoryDefinitions[0],
)

const currentViewLabel = computed(
  () => viewOptions.find((option) => option.value === activeView.value)?.label ?? '',
)

const currentModalityLabel = computed(
  () => modalityOptions.find((option) => option.value === activeModality.value)?.label ?? '',
)

function resolveAssetKey(view, modality) {
  if (view === 'original' && modality === 'rgb') return 'rgb_original'
  if (view === 'original' && modality === 'infrared') return 'x_original'
  if (view === 'prediction' && modality === 'rgb') return 'rgb_prediction'
  if (view === 'prediction' && modality === 'infrared') return 'x_prediction'
  if (modality === 'rgb') return 'rgb_gt'
  return 'x_gt'
}

function getScenePreviewSequence(scene) {
  const sequence = []
  const orderedViews = ['original', 'prediction', 'gt']
  const orderedModalities = ['rgb', 'infrared']

  orderedModalities.forEach((modality) => {
    orderedViews.forEach((view) => {
      if (scene.availableViews.includes(view)) {
        sequence.push({ view, modality })
      }
    })
  })

  return sequence
}

const activeMediaKey = computed(() => resolveAssetKey(activeView.value, activeModality.value))
const activeMediaSrc = computed(() => currentScene.value.assets[activeMediaKey.value] || '')
const isActiveVideo = computed(
  () => currentScene.value.mediaType === 'video' && Boolean(activeMediaSrc.value),
)
const hasActiveMedia = computed(() => Boolean(activeMediaSrc.value) && !mediaErrored.value)
const isMediaLoading = computed(
  () =>
    Boolean(activeMediaSrc.value) &&
    !mediaErrored.value &&
    (!mediaLoaded.value || (isActiveVideo.value && videoBuffering.value)),
)
const mediaLoadingLabel = computed(() => {
  return '模型推理中'
})

const activeMediaAlt = computed(
  () => `${currentScene.value.title} ${currentViewLabel.value} ${currentModalityLabel.value}`,
)

const activeMediaCaption = computed(() => {
  if (!hasActiveMedia.value) {
    return '当前视图没有可用媒体，建议切换其他场景或其他视图继续浏览。'
  }

  if (activeView.value === 'original') {
    return isActiveVideo.value
      ? `当前播放 ${currentModalityLabel.value} 原始输入视频，用于观察场景本身的感知条件、运动状态与复杂因素。`
      : `当前显示 ${currentModalityLabel.value} 原始输入图像，用于观察场景本身的感知条件与复杂因素。`
  }

  if (activeView.value === 'prediction') {
    return isActiveVideo.value
      ? `当前播放 ${currentModalityLabel.value} 推理结果视频，用于观察模型在连续帧中的输出稳定性。`
      : `当前显示 ${currentModalityLabel.value} 推理结果图像，用于观察模型在该场景下的输出表现。`
  }

  return `当前显示 ${currentModalityLabel.value} GT 标准答案，用于结果对照。`
})

const cueItems = computed(() => [
  {
    label: '关键挑战',
    value: currentScene.value.challenge,
  },
  {
    label: '识别目标',
    value: currentScene.value.targets,
  },
  {
    label: '模型表现',
    value: currentScene.value.performance,
  },
  {
    label: '所属类别',
    value: currentCategory.value.title,
  },
])

watch(activeMediaSrc, (nextSrc, previousSrc) => {
  mediaErrored.value = false
  clearBufferingTimer()
  videoBuffering.value = Boolean(nextSrc) && currentScene.value.mediaType === 'video'
  if (!nextSrc) {
    mediaLoaded.value = false
    return
  }

  if (nextSrc !== previousSrc) {
    mediaLoaded.value = false
  }
})

watch(
  selectedSceneId,
  () => {
    openCategoryKey.value = currentScene.value.categoryKey
    activeView.value = currentScene.value.availableViews.includes(activeView.value)
      ? activeView.value
      : currentScene.value.availableViews[0]

    if (currentScene.value.mediaType === 'video') {
      activeView.value = 'original'
      activeModality.value = 'rgb'
      stopScenePreview()
      return
    }

    startScenePreview()
  },
  { immediate: true },
)

function clearScenePreviewTimer() {
  if (!autoplayTimer) return
  window.clearTimeout(autoplayTimer)
  autoplayTimer = null
}

function clearBufferingTimer() {
  if (!bufferingTimer) return
  window.clearTimeout(bufferingTimer)
  bufferingTimer = null
}

function hideVideoBuffering() {
  clearBufferingTimer()
  videoBuffering.value = false
}

function scheduleVideoBuffering() {
  if (!isActiveVideo.value) return

  clearBufferingTimer()
  bufferingTimer = window.setTimeout(() => {
    videoBuffering.value = true
  }, 220)
}

function scheduleScenePreviewAdvance(sessionToken) {
  if (!isAutoCycling.value || sessionToken !== previewSessionToken) return

  clearScenePreviewTimer()
  const sequence = getScenePreviewSequence(currentScene.value)

  autoplayTimer = window.setTimeout(() => {
    if (!isAutoCycling.value || sessionToken !== previewSessionToken) return

    if (previewStepIndex >= sequence.length - 1) {
      stopScenePreview()
      return
    }

    previewStepIndex += 1
    runScenePreviewStep(sessionToken)
  }, scenePreviewIntervalMs)
}

function stopScenePreview() {
  clearScenePreviewTimer()
  isAutoCycling.value = false
}

function runScenePreviewStep(sessionToken) {
  if (!isAutoCycling.value || sessionToken !== previewSessionToken) return

  const step = getScenePreviewSequence(currentScene.value)[previewStepIndex]

  if (!step) {
    stopScenePreview()
    return
  }

  const nextMediaSrc = currentScene.value.assets[resolveAssetKey(step.view, step.modality)] || ''
  const isSameMedia = nextMediaSrc === activeMediaSrc.value

  mediaErrored.value = false
  clearBufferingTimer()
  videoBuffering.value = Boolean(nextMediaSrc) && currentScene.value.mediaType === 'video'
  if (!isSameMedia) {
    mediaLoaded.value = false
  }

  activeView.value = step.view
  activeModality.value = step.modality

  if (!nextMediaSrc) {
    scheduleScenePreviewAdvance(sessionToken)
    return
  }

  if (isSameMedia && mediaLoaded.value) {
    scheduleScenePreviewAdvance(sessionToken)
  }
}

function startScenePreview() {
  if (currentScene.value.mediaType === 'video') {
    stopScenePreview()
    return
  }

  stopScenePreview()
  previewSessionToken += 1
  previewStepIndex = 0
  isAutoCycling.value = true
  runScenePreviewStep(previewSessionToken)
}

function setSelectedScene(sceneId) {
  if (selectedSceneId.value === sceneId) {
    if (currentScene.value.mediaType === 'video') {
      activeView.value = 'original'
      activeModality.value = 'rgb'
      return
    }

    startScenePreview()
    return
  }

  selectedSceneId.value = sceneId
}

function compactTags(tags) {
  return tags.slice(0, 2).join(' / ')
}

function setOpenCategory(value) {
  openCategoryKey.value = value
}

function goToPreviousScene() {
  if (!hasPreviousScene.value) return
  setSelectedScene(sceneCatalog[currentSceneIndex.value - 1].id)
}

function goToNextScene() {
  if (!hasNextScene.value) return
  setSelectedScene(sceneCatalog[currentSceneIndex.value + 1].id)
}

function setActiveView(value) {
  if (!currentScene.value.availableViews.includes(value)) return
  stopScenePreview()
  activeView.value = value
}

function setActiveModality(value) {
  stopScenePreview()
  activeModality.value = value
}

function handleMediaLoad() {
  mediaLoaded.value = true
  hideVideoBuffering()

  if (isActiveVideo.value) {
    activeVideoRef.value?.play?.().catch(() => {})
  }

  if (isAutoCycling.value) {
    scheduleScenePreviewAdvance(previewSessionToken)
  }
}

function handleVideoLoadStart() {
  mediaErrored.value = false
  mediaLoaded.value = false
  videoBuffering.value = true
}

function handleVideoCanPlay() {
  mediaLoaded.value = true
  hideVideoBuffering()
  activeVideoRef.value?.play?.().catch(() => {})
}

function handleVideoPlaying() {
  mediaLoaded.value = true
  hideVideoBuffering()
}

function handleVideoWaiting() {
  if (!isActiveVideo.value) return
  scheduleVideoBuffering()
}

function handleMediaError() {
  mediaErrored.value = true
  mediaLoaded.value = false
  hideVideoBuffering()

  if (isAutoCycling.value) {
    scheduleScenePreviewAdvance(previewSessionToken)
  }
}

function handleSwitcherKeydown(event, options, currentValue, setter) {
  const normalizedOptions = Array.isArray(options) ? options : options.value
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(event.key)) return

  event.preventDefault()

  const currentIndex = normalizedOptions.findIndex((option) => option.value === currentValue.value)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1 + normalizedOptions.length) % normalizedOptions.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = normalizedOptions.length - 1
  }

  setter(normalizedOptions[nextIndex].value)

  const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
  buttons[nextIndex]?.focus()
}

onMounted(() => {
  if (!pageRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  context = gsap.context(() => {
    const nav = pageRef.value.querySelector('.project-nav')
    const stageHead = pageRef.value.querySelector('.project-stage__head')
    const toolbar = pageRef.value.querySelector('.project-toolbar')
    const display = pageRef.value.querySelector('.project-display')
    const cues = pageRef.value.querySelectorAll('.project-cue')

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(nav, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.56 })
      .fromTo(stageHead, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.54 }, 0.08)
      .fromTo(toolbar, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.14)
      .fromTo(display, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.66 }, 0.22)
      .fromTo(
        cues,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.04 },
        0.3,
      )
  }, pageRef)
})

onBeforeUnmount(() => {
  stopScenePreview()
  clearBufferingTimer()
  context?.revert()
})
</script>

<style scoped>
.project-view {
  --project-title: #f4ede1;
  --project-copy: rgba(225, 221, 213, 0.88);
  --project-copy-soft: rgba(193, 187, 177, 0.76);
  --project-kicker: rgba(215, 181, 116, 0.88);
  --project-accent: #d7b574;
  --project-accent-strong: #e3c68a;
  --project-accent-soft: rgba(215, 181, 116, 0.12);
  --project-line: rgba(207, 178, 121, 0.14);
  --project-line-strong: rgba(207, 178, 121, 0.34);
  --project-divider: rgba(207, 178, 121, 0.1);
  --project-surface: rgba(10, 15, 23, 0.82);
  --project-screen: rgba(4, 8, 14, 0.94);
  --project-screen-glow: rgba(215, 181, 116, 0.08);
  --project-shadow: rgba(0, 0, 0, 0.24);
  min-height: calc(100vh - 56px);
  padding: 22px 20px 40px;
  color: var(--project-title);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
}

.theme-light.project-view {
  --project-title: #1f2530;
  --project-copy: rgba(48, 53, 61, 0.88);
  --project-copy-soft: rgba(88, 89, 88, 0.74);
  --project-kicker: rgba(164, 120, 52, 0.92);
  --project-accent: #c89b57;
  --project-accent-strong: #b78031;
  --project-accent-soft: rgba(197, 155, 79, 0.12);
  --project-line: rgba(165, 125, 60, 0.16);
  --project-line-strong: rgba(165, 125, 60, 0.32);
  --project-divider: rgba(165, 125, 60, 0.12);
  --project-surface: rgba(255, 252, 246, 0.92);
  --project-screen: rgba(242, 236, 226, 0.98);
  --project-screen-glow: rgba(194, 142, 67, 0.08);
  --project-shadow: rgba(65, 54, 37, 0.08);
}

.project-shell {
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.project-kicker {
  margin: 0;
  color: var(--project-kicker);
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.project-nav,
.project-stage {
  border: 1px solid var(--project-line);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--project-surface) 97%, transparent),
    var(--project-surface)
  );
  box-shadow: 0 28px 72px var(--project-shadow);
}

.project-nav {
  display: grid;
  gap: 1.2rem;
  padding: 18px 12px;
}

.project-nav__head {
  display: grid;
  gap: 0.45rem;
}

.project-nav__head h1,
.project-stage__title h2 {
  margin: 0;
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-weight: 500;
}

.project-nav__head h1 {
  font-size: clamp(1.5rem, 2vw, 1.88rem);
  line-height: 1.1;
}

.project-nav__head span,
.project-stage__title p,
.project-display__caption,
.project-cue p,
.project-display__empty p {
  color: var(--project-copy-soft);
}

.project-nav__head span {
  font-size: var(--argus-type-meta);
  line-height: 1.55;
}

.project-nav__groups {
  display: grid;
  gap: 0.7rem;
}

.project-nav-group {
  display: grid;
  gap: 0.55rem;
}

.project-nav-group__trigger,
.project-scene-button,
.project-switcher__button {
  appearance: none;
  border: none;
  font: inherit;
}

.project-nav-group__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.project-nav-group__trigger:hover {
  border-color: var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 72%, transparent);
}

.project-nav-group__trigger.is-open {
  border-color: var(--project-line-strong);
  background: color-mix(in srgb, var(--project-accent) 10%, var(--project-surface));
}

.project-nav-group__trigger span {
  color: var(--project-title);
  font-size: 0.97rem;
  line-height: 1.35;
}

.project-nav-group__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.project-nav-group__trigger strong,
.project-nav-group__trigger i {
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
  font-weight: 500;
}

.project-nav-group__trigger i {
  font-style: normal;
  line-height: 1;
}

.project-nav-group__list {
  display: grid;
  gap: 0.5rem;
}

.project-scene-button {
  display: grid;
  gap: 0.2rem;
  width: 100%;
  min-width: 0;
  padding: 0.85rem 0.85rem 0.9rem;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.project-scene-button:hover {
  transform: translateY(-1px);
  border-color: var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 74%, transparent);
}

.project-nav-group__trigger:focus-visible,
.project-scene-button:focus-visible,
.project-switcher__button:focus-visible {
  outline: 2px solid var(--project-accent-strong);
  outline-offset: 2px;
}

.project-scene-button.is-active {
  border-color: var(--project-line-strong);
  background: color-mix(in srgb, var(--project-accent) 14%, var(--project-surface));
}

.project-scene-button__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.project-scene-button strong {
  overflow: hidden;
  color: var(--project-title);
  font-size: 0.98rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-scene-button small {
  overflow: hidden;
  color: var(--project-copy-soft);
  font-size: var(--argus-type-meta);
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-scene-button__badge {
  flex: none;
  padding: 0.15rem 0.42rem;
  border: 1px solid color-mix(in srgb, var(--project-accent) 58%, transparent);
  color: var(--project-kicker);
  font-size: 0.68rem;
  line-height: 1.35;
}

.project-stage {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-width: 0;
}

.project-stage__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem 1.4rem;
  align-items: start;
  padding: 20px 24px 12px;
  border-bottom: 1px solid var(--project-divider);
}

.project-stage__heading {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

.project-stage__title {
  display: grid;
  gap: 0.42rem;
  min-width: 0;
}

.project-stage__title h2 {
  font-size: clamp(1.95rem, 2.6vw, 2.6rem);
  line-height: 1.06;
}

.project-stage__title p {
  margin: 0;
  max-width: 34ch;
  font-size: 0.92rem;
  line-height: 1.55;
}

.project-stage__control-panel {
  display: grid;
  justify-items: end;
  gap: 0.6rem;
  min-width: 0;
}

.project-stage__browse {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: start;
  justify-content: flex-end;
}

.project-stage__browse-button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--project-line);
  background: transparent;
  color: var(--project-copy);
  font: inherit;
  font-size: 0.84rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.project-stage__browse-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--project-line-strong);
  background: color-mix(in srgb, var(--project-surface) 76%, transparent);
}

.project-stage__browse-button:focus-visible {
  outline: 2px solid var(--project-accent-strong);
  outline-offset: 2px;
}

.project-stage__browse-button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.project-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem 0.85rem;
  padding: 0;
  border-bottom: none;
}

.project-switcher {
  display: grid;
  gap: 0.32rem;
  justify-items: end;
}

.project-switcher__label {
  color: var(--project-copy-soft);
  font-size: 0.72rem;
  line-height: 1.4;
  letter-spacing: 0.08em;
}

.project-switcher__group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.34rem;
  padding: 0.28rem;
  border: 1px solid var(--project-line-strong);
  background: color-mix(in srgb, var(--project-surface) 86%, transparent);
}

.project-switcher__button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--project-copy);
  font-size: 0.88rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.project-switcher__button:hover {
  transform: translateY(-1px);
  border-color: var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 72%, transparent);
}

.project-switcher__button.is-active {
  border-color: color-mix(in srgb, var(--project-accent) 62%, transparent);
  background: color-mix(in srgb, var(--project-accent) 22%, var(--project-surface));
  color: var(--project-title);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--project-accent) 18%, transparent);
}

.project-stage__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 268px;
  gap: 16px;
  align-items: start;
  padding: 16px 24px 20px;
}

.project-display {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
  width: min(100%, 760px);
}

.project-display__frame {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 5 / 4;
  width: 100%;
  max-height: 84vh;
  margin-left: 24px;
  padding: 10px;
  border: 1px solid var(--project-line-strong);
  background:
    radial-gradient(circle at 50% 0%, var(--project-screen-glow), transparent 46%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--project-screen) 96%, transparent),
      var(--project-screen)
    );
  overflow: hidden;
}

.project-display__frame::after {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid color-mix(in srgb, var(--project-line) 90%, transparent);
  pointer-events: none;
}

.project-display__chips {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-display__chips span {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid var(--project-line);
  background: color-mix(in srgb, var(--project-surface) 84%, transparent);
  color: var(--project-copy);
  font-size: var(--argus-type-meta);
}

.project-display__autoplay-chip {
  border-color: color-mix(in srgb, var(--project-accent) 56%, transparent);
  background: color-mix(in srgb, var(--project-accent) 18%, var(--project-surface));
  color: var(--project-title);
}

.project-display__image,
.project-display__video,
.project-display__empty {
  position: relative;
  z-index: 0;
}

.project-display__image,
.project-display__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.project-display__image.is-loaded,
.project-display__video.is-loaded {
  opacity: 1;
}

.project-display__loading {
  position: absolute;
  inset: auto auto 18px 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 38px;
  padding: 0 0.85rem;
  border: 1px solid color-mix(in srgb, var(--project-accent) 34%, transparent);
  background: color-mix(in srgb, var(--project-surface) 90%, transparent);
  color: var(--project-title);
  font-size: var(--argus-type-meta);
  line-height: 1;
  backdrop-filter: blur(8px);
}

.project-display__spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid color-mix(in srgb, var(--project-accent) 22%, transparent);
  border-top-color: var(--project-accent);
  border-radius: 999px;
  animation: project-spin 0.8s linear infinite;
}

.project-display__empty {
  display: grid;
  gap: 0.45rem;
  max-width: 30rem;
  padding: 2rem;
  text-align: center;
}

.project-display__empty strong {
  color: var(--project-title);
  font-size: 1.1rem;
  line-height: 1.45;
}

.project-display__empty p {
  margin: 0;
  line-height: 1.65;
}

.project-display__caption {
  margin: 0;
  font-size: var(--argus-type-meta);
  line-height: 1.58;
}

.project-cues {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  align-content: start;
}

.project-cue {
  display: grid;
  gap: 0.28rem;
  min-width: 0;
  padding-top: 0.62rem;
  border-top: 1px solid var(--project-divider);
}

.project-cue span {
  color: var(--project-kicker);
  font-size: var(--argus-type-meta);
}

.project-cue p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.56;
}

@keyframes project-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1280px) {
  .project-stage__body {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
}

@media (max-width: 1040px) {
  .project-view {
    padding: 22px 16px 52px;
  }

  .project-shell {
    grid-template-columns: 1fr;
  }

  .project-stage__head {
    grid-template-columns: 1fr;
  }

  .project-stage__control-panel,
  .project-switcher {
    justify-items: start;
  }

  .project-toolbar,
  .project-stage__browse {
    justify-content: flex-start;
  }

  .project-stage__body {
    grid-template-columns: 1fr;
  }

  .project-display {
    width: 100%;
  }

  .project-cues {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1rem;
  }
}

@media (max-width: 720px) {
  .project-stage__head,
  .project-toolbar,
  .project-stage__body {
    padding-left: 18px;
    padding-right: 18px;
  }

  .project-stage__title h2 {
    font-size: clamp(1.8rem, 8vw, 2.4rem);
  }

  .project-display__frame {
    padding: 14px;
  }

  .project-display__frame::after {
    inset: 10px;
  }

  .project-cues {
    grid-template-columns: 1fr;
  }

  .project-display__loading {
    left: 14px;
    bottom: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-display__image,
  .project-display__video {
    transition: none;
  }

  .project-display__spinner {
    animation: none;
  }
}
</style>
