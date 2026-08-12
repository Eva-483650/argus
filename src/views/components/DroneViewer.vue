<template>
  <main ref="pageRef" class="drone-showcase" :class="`theme-${themeMode}`">
    <div class="drone-showcase__backdrop">
      <div class="drone-showcase__orb drone-showcase__orb--a"></div>
      <div class="drone-showcase__orb drone-showcase__orb--b"></div>
      <div class="drone-showcase__mesh"></div>
    </div>

    <div class="drone-showcase__canvas">
      <DroneSceneCanvas :theme-mode="themeMode" @ready="setupExperience" />
    </div>

    <div class="showcase-scroll-hint">
      <span class="showcase-scroll-hint__line"></span>
      <span class="showcase-scroll-hint__text">{{ currentStepLabel }}</span>
    </div>

    <div class="drone-showcase__content">
      <StorySection
        v-for="section in sections"
        :key="section.id"
        :section-id="section.id"
        :background-label="section.backgroundLabel"
        :eyebrow="section.eyebrow"
        :title="section.title"
        :description="section.description"
        :caption="section.caption"
        :metrics="section.metrics"
        :align="section.align"
        :variant="section.variant"
      />

      <StorySection
        :section-id="demoAct.id"
        :background-label="demoAct.backgroundLabel"
        :eyebrow="demoAct.eyebrow"
        :title="demoAct.title"
        :description="demoAct.description"
        :caption="demoAct.caption"
        :align="demoAct.align"
        :variant="demoAct.variant"
        :metrics="[]"
        class="demo-video-section"
      >
        <template #media>
          <div class="demo-video-frame">
            <video
              v-if="demoVideo.src"
              class="demo-video-frame__media"
              :src="demoVideo.src"
              :poster="demoVideo.poster || undefined"
              controls
              playsinline
              preload="auto"
            ></video>

            <div v-else class="demo-video-frame__placeholder">
              <span class="demo-video-frame__badge">项目介绍视频占位</span>
              <p class="demo-video-frame__hint">请在这里放入项目介绍视频，便于集中展示研究背景、方法流程与实验结果。</p>
              <code class="demo-video-frame__path">@/assets/video/projectvideo_balanced.mp4</code>
            </div>
          </div>
        </template>
      </StorySection>
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, inject, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StorySection from './drone-showcase/StorySection.vue'
import demoVideoSrc from '@/assets/video/projectvideo_balanced.mp4'

gsap.registerPlugin(ScrollTrigger)

const DroneSceneCanvas = defineAsyncComponent({
  loader: () => import('./drone-showcase/DroneSceneCanvas.vue'),
  delay: 0,
  suspensible: false,
})

const injectedTheme = inject('argusTheme', ref(true))
const themeMode = computed(() => (injectedTheme.value ? 'dark' : 'light'))

const pageRef = ref(null)
const currentSection = ref('section-launch')
const demoVideo = {
  src: demoVideoSrc,
  poster: '',
}

const sections = [
  {
    id: 'section-launch',
    nav: '01',
    backgroundLabel: 'Research',
    label: '研究',
    eyebrow: '研究背景',
    title: 'RegisterBridgeMM 面向全天候交通场景中的无人机视角多模态小目标实时检测。',
    description:
      '项目聚焦智慧交通中的高空巡检与道路监测任务。无人机能够快速覆盖大范围路网，但在高空俯视视角下，车辆、行人和非机动车通常只占少量像素；夜间、低照度、雾霾和阴雨等条件又会削弱可见光成像质量，密集交通流中的遮挡进一步提升了检测难度。\n\n研究目标是在受限计算预算下，同时解决小目标尺度小、模态信息退化和复杂场景遮挡三类问题，为交通巡检、夜间道路监测和复杂天气条件下的目标感知提供稳定的实时检测能力。',
    caption: '应用背景 / 核心问题 / 研究目标',
    align: 'right',
    variant: 'hero',
    metrics: [
      { value: '全天候交通', label: '应用场景' },
      { value: '无人机视角', label: '感知视角' },
    ],
  },
  {
    id: 'section-detail',
    nav: '02',
    backgroundLabel: 'Architecture',
    label: '架构',
    eyebrow: '方法设计',
    title: '双流冻结视觉基础模型与 Register Token 桥接机制构成了 RegisterBridgeMM 的核心路径。',
    description:
      '方法以 RGB 与红外双流冻结视觉基础模型为主干，在中间层利用 Register Token 建立低成本、对等的跨模态通信。RWPR 与 RCRS 负责跨模态信息交换与质量控制，在避免全 patch 级交叉注意力高开销的同时，尽可能保留预训练表征能力。\n\n在特征融合阶段，模型结合独立空间先验分支、residual-concat 多尺度融合以及 RG-PADI 小目标自适应细节注入策略，对小目标密集区域增强结构细节、对大面积背景抑制无效放大，从而兼顾融合有效性、小目标判别能力与实时部署需求。',
    caption: '双流冻结骨干 / Register 桥接 / 小目标增强',
    align: 'left',
    variant: 'method',
    metrics: [
      { value: 'Register Token', label: '桥接载体' },
      { value: 'RG-PADI', label: '细节注入策略' },
    ],
  },
  {
    id: 'section-emotion',
    nav: '03',
    backgroundLabel: 'Results',
    label: '结果',
    eyebrow: '实验表现',
    title: '实验结果表明，该框架在检测精度、鲁棒性与实时性之间取得了稳定平衡。',
    description:
      'RegisterBridgeMM 在 DroneVehicle、LLVIP、FLIR-Aligned 和 M3FD 等公开数据集上均取得稳定且具有竞争力的性能。其中，在 DroneVehicle 数据集上达到 81.5% 的 mAP@0.5 和 61.6% 的 mAP@0.5:0.95，并在单张 RTX 4090 上实现 26.8 FPS 的推理速度。\n\n这些结果说明，方法不仅能有效挖掘 RGB 与红外模态的互补信息，也具备面向真实交通业务的工程可用性，可服务于无人机交通巡检、重点路段车流统计、夜间道路监管和复杂天气下的目标感知。',
    caption: '公开数据集 / 关键指标 / 应用价值',
    align: 'right',
    variant: 'outcome',
    metrics: [
      { value: '81.5%', label: 'DroneVehicle mAP@0.5' },
      { value: '26.8 FPS', label: 'RTX 4090 推理速度' },
    ],
  },
]

const demoAct = {
  id: 'section-demo-video',
  nav: '04',
  backgroundLabel: 'Video',
  label: '视频',
  eyebrow: '项目介绍视频',
  caption: '研究概述 / 方法演示 / 结果说明',
  title: 'RegisterBridgeMM项目介绍',
  description:
    '用于展示 RegisterBridgeMM 的任务背景、核心模块、检测效果与应用场景。',
  align: 'left',
  variant: 'demo',
}

const navigationItems = [
  ...sections.map(({ id, nav, label, eyebrow }) => ({ id, nav, label, eyebrow })),
  (({ id, nav, label, eyebrow }) => ({ id, nav, label, eyebrow }))(demoAct),
]

const currentStepLabel = computed(() => {
  const activeItem = navigationItems.find((item) => item.id === currentSection.value)
  if (!activeItem) {
    return '滚动浏览'
  }
  return `${activeItem.nav} ${activeItem.label}`
})

let context
let refreshHandler

function setCurrentSection(id) {
  currentSection.value = id
}

const setupExperience = ({ sceneState, handleResize, playIntro }) => {
  if (!pageRef.value || context) return

  context = gsap.context(() => {
    const page = pageRef.value
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollHint = page.querySelector('.showcase-scroll-hint')
    const sectionNodes = gsap.utils.toArray(page.querySelectorAll('.story-section'))
    const orbA = page.querySelector('.drone-showcase__orb--a')
    const orbB = page.querySelector('.drone-showcase__orb--b')
    const mesh = page.querySelector('.drone-showcase__mesh')
    const getSectionParts = (section) => ({
      section,
      background: section.querySelector('.story-section__background'),
      eyebrow: section.querySelector('.story-copy__eyebrow'),
      caption: section.querySelector('.story-copy__caption'),
      title: section.querySelector('.story-copy__title'),
      body: section.querySelector('.story-copy__body'),
      metrics: section.querySelector('.story-copy__metrics'),
      frame: section.querySelector('.demo-video-frame'),
    })
    const sectionParts = sectionNodes.map(getSectionParts)
    const launchParts = sectionParts.find(({ section }) => section.id === 'section-launch')
    const sceneIntro = playIntro()

    if (prefersReducedMotion) {
      sceneIntro.progress(1)
      gsap.set(scrollHint, { autoAlpha: 1, y: 0 })

      sectionParts.forEach(({ background, eyebrow, caption, title, body, metrics, frame }) => {
        gsap.set([background, eyebrow, caption, title, body, metrics, frame].filter(Boolean), {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
          scale: 1,
          clearProps: 'transform',
        })
      })
    } else {
      gsap.set(scrollHint, { autoAlpha: 0, y: 24 })

      sectionParts.forEach(({ section, background, eyebrow, caption, title, body, metrics, frame }) => {
        if (section.id === 'section-launch') {
          gsap.set([eyebrow, caption, title, body, metrics, frame].filter(Boolean), {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clearProps: 'transform',
          })
          gsap.set(background, { autoAlpha: 0.68, yPercent: 0 })
          return
        }

        gsap.set([eyebrow, caption].filter(Boolean), { autoAlpha: 0, y: 18 })
        gsap.set(title, { autoAlpha: 0, y: 34 })
        gsap.set([body, metrics].filter(Boolean), { autoAlpha: 0, y: 24 })
        gsap.set(background, { autoAlpha: 0, yPercent: 12 })
        gsap.set(frame, { autoAlpha: 0, y: 40, scale: 0.985, transformOrigin: 'center center' })
      })

      if (launchParts) {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .add(sceneIntro, 0)
          .to(scrollHint, { autoAlpha: 1, y: 0, duration: 1.8 }, 1.05)
      }

      if (orbA) {
        gsap.to(orbA, {
          xPercent: 2,
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: page,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        })
      }

      if (orbB) {
        gsap.to(orbB, {
          xPercent: -2,
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: page,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.65,
          },
        })
      }

      if (mesh) {
        gsap.to(mesh, {
          yPercent: -3,
          ease: 'none',
          scrollTrigger: {
            trigger: page,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.8,
          },
        })
      }
    }

    const overviewSection = document.getElementById('section-launch')
    const detailSection = document.getElementById('section-detail')
    const emotionSection = document.getElementById('section-emotion')

    if (overviewSection) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: overviewSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.68,
          },
        })
        .to(sceneState, { overview: 1, ease: 'none' })
    }

    if (detailSection) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: detailSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.74,
          },
        })
        .to(sceneState, { detail: 1, ease: 'none' })
        .to(sceneState, { overview: 0.68, ease: 'none' }, 0)
    }

    if (emotionSection) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: emotionSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.82,
          },
        })
        .to(sceneState, { emotion: 1, ease: 'none' })
        .to(sceneState, { detail: 0.86, ease: 'none' }, 0)
    }

    navigationItems.forEach((item) => {
      const node = document.getElementById(item.id)
      if (!node) return

      ScrollTrigger.create({
        trigger: node,
        start: item.id === 'section-demo-video' ? 'top 55%' : 'top 45%',
        end: item.id === 'section-demo-video' ? 'bottom 40%' : 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) {
            setCurrentSection(item.id)
          }
        },
      })
    })

    sectionParts.forEach(({ section, background, eyebrow, caption, title, body, metrics, frame }) => {
      if (section.id === 'section-launch' || prefersReducedMotion) {
        return
      }

      const revealTimeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
        scrollTrigger: {
          trigger: section,
          start: section.id === demoAct.id ? 'top 76%' : 'top 74%',
          toggleActions: 'play none none reverse',
        },
      })

      if (background) {
        revealTimeline.fromTo(
          background,
          { autoAlpha: 0, yPercent: 12 },
          {
            autoAlpha: section.id === demoAct.id ? 0.78 : 0.84,
            yPercent: 0,
            duration: 0.72,
          },
          0.02,
        )
      }

      revealTimeline.fromTo(
        [eyebrow, caption].filter(Boolean),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.56, stagger: 0.08 },
        0.06,
      )

      revealTimeline.fromTo(
        title,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.78 },
        0.18,
      )

      revealTimeline.fromTo(
        [body, metrics].filter(Boolean),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.12 },
        0.32,
      )

      if (frame) {
        revealTimeline.fromTo(
          frame,
          { autoAlpha: 0, y: 40, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.74 },
          0.44,
        )
      }
    })

    if (!prefersReducedMotion) {
      gsap.to('.showcase-scroll-hint__line', {
        yPercent: 86,
        repeat: -1,
        duration: 1.45,
        ease: 'power1.inOut',
        yoyo: true,
      })
    }

    refreshHandler = () => handleResize()
    ScrollTrigger.addEventListener('refresh', refreshHandler)

    requestAnimationFrame(() => {
      handleResize()
      ScrollTrigger.refresh()
    })
  }, pageRef)
}

onBeforeUnmount(() => {
  if (refreshHandler) {
    ScrollTrigger.removeEventListener('refresh', refreshHandler)
  }
  context?.revert()
})
</script>

<style scoped>
.is-left .story-section__background {
  left: auto;
  right: 0;
  text-align: right;
}
.drone-showcase {
  --showcase-bg: transparent;
  --showcase-title: #f4efe5;
  --showcase-body: rgba(222, 219, 210, 0.82);
  --showcase-caption: rgba(174, 171, 164, 0.7);
  --showcase-accent: #c8a86a;
  --showcase-accent-soft: rgba(200, 168, 106, 0.78);
  --showcase-card-top: rgba(255, 255, 255, 0.06);
  --showcase-card-bottom: rgba(255, 255, 255, 0.015);
  --showcase-card-base: rgba(10, 14, 20, 0.26);
  --showcase-card-border: rgba(200, 168, 106, 0.12);
  --showcase-card-shadow: rgba(0, 0, 0, 0.14);
  --showcase-metric-border: rgba(255, 255, 255, 0.08);
  --showcase-ghost: rgba(241, 232, 214, 0.06);
  --showcase-dot: rgba(200, 168, 106, 0.14);
  --showcase-dot-active: #f4efe5;
  --showcase-dot-text: rgba(210, 205, 194, 0.68);
  --showcase-sidebar-bg: rgba(10, 14, 20, 0.28);
  --showcase-sidebar-border: rgba(200, 168, 106, 0.1);
  --showcase-sidebar-shadow: rgba(5, 10, 16, 0.16);
  --showcase-sidebar-rail: rgba(200, 168, 106, 0.14);
  --showcase-sidebar-progress: linear-gradient(180deg, rgba(200, 168, 106, 0.94) 0%, rgba(237, 227, 205, 0.72) 100%);
  --showcase-mesh: rgba(227, 217, 196, 0.035);
  --showcase-hint: rgba(218, 212, 200, 0.72);
  position: relative;
  min-height: 360vh;
  overflow: clip;
  background: var(--showcase-bg);
  color: var(--showcase-title);
}

.theme-light {
  --showcase-bg: transparent;
  --showcase-title: #1d2430;
  --showcase-body: rgba(56, 61, 69, 0.82);
  --showcase-caption: rgba(98, 102, 108, 0.74);
  --showcase-accent: #b78b43;
  --showcase-accent-soft: rgba(183, 139, 67, 0.74);
  --showcase-card-top: rgba(255, 255, 255, 0.68);
  --showcase-card-bottom: rgba(245, 241, 234, 0.48);
  --showcase-card-base: rgba(255, 253, 248, 0.34);
  --showcase-card-border: rgba(183, 139, 67, 0.14);
  --showcase-card-shadow: rgba(82, 72, 52, 0.08);
  --showcase-metric-border: rgba(145, 135, 118, 0.18);
  --showcase-ghost: rgba(72, 64, 50, 0.08);
  --showcase-dot: rgba(183, 139, 67, 0.14);
  --showcase-dot-active: #1d2430;
  --showcase-dot-text: rgba(78, 76, 72, 0.74);
  --showcase-sidebar-bg: rgba(255, 251, 244, 0.48);
  --showcase-sidebar-border: rgba(183, 139, 67, 0.12);
  --showcase-sidebar-shadow: rgba(94, 82, 62, 0.06);
  --showcase-sidebar-rail: rgba(183, 139, 67, 0.14);
  --showcase-sidebar-progress: linear-gradient(180deg, rgba(183, 139, 67, 0.92) 0%, rgba(244, 236, 219, 0.88) 100%);
  --showcase-mesh: rgba(69, 60, 47, 0.04);
  --showcase-hint: rgba(88, 84, 77, 0.74);
}

.drone-showcase__backdrop,
.drone-showcase__canvas {
  position: fixed;
  inset: 0;
}

.drone-showcase__backdrop {
  z-index: 0;
  pointer-events: none;
}

.drone-showcase__canvas {
  z-index: 1;
  pointer-events: none;
}

.drone-showcase__content,
.showcase-scroll-hint {
  position: relative;
  z-index: 2;
}

.drone-showcase__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(128px);
  opacity: 0.16;
  will-change: transform;
}

.drone-showcase__orb--a {
  top: 10%;
  left: -10%;
  width: 42vw;
  height: 42vw;
  background: rgba(198, 170, 120, 0.14);
}

.drone-showcase__orb--b {
  right: -8%;
  bottom: 8%;
  width: 34vw;
  height: 34vw;
  background: rgba(255, 247, 233, 0.1);
}

.drone-showcase__mesh {
  position: absolute;
  inset: 0;
  background-size: 120px 120px;
  mask-image: linear-gradient(
    180deg,
    transparent,
    rgba(0, 0, 0, 0.9) 18%,
    rgba(0, 0, 0, 0.9) 82%,
    transparent
  );
  will-change: transform;
}

.showcase-scroll-hint {
  position: fixed;
  left: min(7vw, 88px);
  bottom: 42px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--showcase-hint);
  min-width: 128px;
}

.showcase-scroll-hint__line {
  width: 1px;
  height: 48px;
  background: linear-gradient(180deg, transparent, currentColor, transparent);
}

.showcase-scroll-hint__text {
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

.drone-showcase__content {
  position: relative;
  z-index: 2;
}

.demo-video-section {
  min-height: 140vh;
}

.demo-video-frame {
  min-height: 72vh;
  border-top: 1px solid var(--showcase-card-border);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
  will-change: transform, opacity;
}

.demo-video-frame__media,
.demo-video-frame__placeholder {
  width: 100%;
  min-height: 72vh;
}

.demo-video-frame__media {
  display: block;
  object-fit: cover;
  background: #05070a;
}

.demo-video-frame__placeholder {
  display: grid;
  place-content: center;
  gap: 14px;
  padding: 40px;
  text-align: center;
  color: var(--showcase-body);
}

.demo-video-frame__badge {
  justify-self: center;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--showcase-card-border);
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.demo-video-frame__hint {
  margin: 0;
  font-size: var(--argus-type-body-sm);
  line-height: var(--argus-leading-body-sm);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-regular);
  text-wrap: pretty;
}

.demo-video-frame__path {
  justify-self: center;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  font-size: var(--argus-type-meta);
  line-height: var(--argus-leading-meta);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-regular);
  letter-spacing: 0.02em;
  color: var(--showcase-title);
  overflow-wrap: anywhere;
  word-break: normal;
}

@media (max-width: 960px) {
  .drone-showcase {
    min-height: 390vh;
  }

  .showcase-scroll-hint {
    left: 20px;
    bottom: 20px;
  }

  .demo-video-section {
    min-height: 120vh;
  }

  .demo-video-frame,
  .demo-video-frame__media,
  .demo-video-frame__placeholder {
    min-height: 48vh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drone-showcase__orb,
  .drone-showcase__mesh,
  .demo-video-frame {
    will-change: auto;
  }
}
</style>
