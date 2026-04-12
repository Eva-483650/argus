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
              preload="metadata"
            ></video>

            <div v-else class="demo-video-frame__placeholder">
              <span class="demo-video-frame__badge">演示视频占位</span>
              <p class="demo-video-frame__hint">请在这里放入最终评测视频，便于评审在完整驾驶序列中验证方法效果。</p>
              <code class="demo-video-frame__path">/videos/drone-demo.mp4</code>
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
  src: '',
  poster: '',
}

const sections = [
  {
    id: 'section-launch',
    nav: '01',
    backgroundLabel: 'Overview',
    label: '概览',
    eyebrow: '研究价值',
    title: 'Argus 聚焦于在恶劣天气与低可见度条件下最难被检测到的交通小目标。',
    description:
      '本项目面向全天候交通场景中的多模态小目标检测。降雨、雾霾、眩光、弱光以及运动模糊都会显著削弱远距离或弱特征目标的可见性。\n\n对于评审而言，关键不在于界面是否足够炫目，而在于系统是否真正解决了有意义的感知问题。Argus 首先围绕这一核心展开：当视觉证据不完整、不稳定，甚至被场景噪声淹没时，仍然保持可靠检测。',
    caption: '问题定义 / 评审语境 / 任务意义',
    align: 'right',
    variant: 'hero',
    metrics: [
      { value: '全天候', label: '目标场景' },
      { value: '小目标', label: '核心挑战' },
    ],
  },
  {
    id: 'section-detail',
    nav: '02',
    backgroundLabel: 'Method',
    label: '方法',
    eyebrow: '技术路线',
    title: '该方法融合多种感知线索，使检测不再依赖单一且脆弱的视觉输入。',
    description:
      'Argus 被设计为一条多模态感知流程。面对不断变化的天气条件，系统不再单独依赖某一路摄像头画面，而是对齐并联合利用互补信号，以恢复那些特征微弱、局部遮挡或容易被背景噪声淹没的小目标。\n\n这一部分应帮助评审快速理解项目贡献：重点在于鲁棒性、融合策略，以及恶劣交通环境下的感知能力，而不仅仅是一个经过包装的 3D 展示界面。这一部分应帮助评审快速理解项目贡献：重点在于鲁棒性、融合策略，以及恶劣交通环境下的感知能力，而不仅仅是一个经过包装的 3D 展示界面。这一部分应帮助评审快速理解项目贡献：重点在于鲁棒性、融合策略，以及恶劣交通环境下的感知能力，而不仅仅是一个经过包装的 3D 展示界面。',
    caption: '多模态融合 / 鲁棒性策略 / 技术贡献',
    align: 'left',
    variant: 'method',
    metrics: [
      { value: '多模态', label: '输入策略' },
      { value: '鲁棒性', label: '设计优先级' },
    ],
  },
  {
    id: 'section-emotion',
    nav: '03',
    backgroundLabel: 'Outcome',
    label: '结果',
    eyebrow: '评估重点',
    title: '最终评审真正关注的是：当场景变得复杂时，系统是否依然可信。',
    description:
      '结果应当基于证据来判断：目标恢复是否更清晰、恶劣天气下的感知是否更稳定，以及在漏检代价真实存在的交通场景中是否具备更高应用价值。\n\n叙事的最后一段应让评审形成明确结论。Argus 不只是一个概念演示，而是一套面向传统方法最不可靠条件下、专门提升检测可信度的研究系统。叙事的最后一段应让评审形成明确结论。Argus 不只是一个概念演示，而是一套面向传统方法最不可靠条件下、专门提升检测可信度的研究系统。叙事的最后一段应让评审形成明确结论。Argus 不只是一个概念演示，而是一套面向传统方法最不可靠条件下、专门提升检测可信度的研究系统。叙事的最后一段应让评审形成明确结论。Argus 不只是一个概念演示，而是一套面向传统方法最不可靠条件下、专门提升检测可信度的研究系统。叙事的最后一段应让评审形成明确结论。Argus 不只是一个概念演示，而是一套面向传统方法最不可靠条件下、专门提升检测可信度的研究系统。',
    caption: '预期证据 / 应用价值 / 最终结论',
    align: 'right',
    variant: 'outcome',
    metrics: [
      { value: '交通场景', label: '应用领域' },
      { value: '可靠检测', label: '评审标准' },
    ],
  },
]

const demoAct = {
  id: 'section-demo-video',
  nav: '04',
  backgroundLabel: 'Demo',
  label: '演示',
  eyebrow: '系统证据',
  caption: '完整序列验证 / 多模态流程 / 评审证据层',
  title: '在完整交通序列中查看整套流程的实际运行效果。',
  description:
    '这一部分应将前面的叙事转化为可验证证据。请在这里展示端到端运行过程，包括多模态输入、恶劣天气下的系统表现、小目标恢复效果，以及真实驾驶场景中的响应过程，让评审能够直接检查结果。',
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
