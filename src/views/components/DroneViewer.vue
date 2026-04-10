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

      <section id="section-demo-video" class="demo-video-section">
        <div class="demo-video-section__inner">
          <div class="demo-video-section__copy">
            <p class="demo-video-section__eyebrow">Demo Video</p>
            <h2 class="demo-video-section__title">See the system in a real traffic scene.</h2>
            <p class="demo-video-section__body">
              Use this section to show the full pipeline in motion: multimodal input, small-object
              detection under adverse conditions, and the final response on a realistic scene. For
              judges, this is the shortest path from concept to evidence.
            </p>
          </div>

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
              <span class="demo-video-frame__badge">Demo Placeholder</span>
              <p class="demo-video-frame__hint">Add the final evaluation video here so judges can verify the method on a complete driving sequence.</p>
              <code class="demo-video-frame__path">/videos/drone-demo.mp4</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DroneSceneCanvas from './drone-showcase/DroneSceneCanvas.vue'
import StorySection from './drone-showcase/StorySection.vue'

gsap.registerPlugin(ScrollTrigger)

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
    label: 'Overview',
    eyebrow: 'Research Value',
    title: 'Argus focuses on the hardest targets to detect when weather and visibility break standard vision pipelines.',
    description:
      'The project targets multimodal small object detection in all-weather traffic scenarios, where rain, haze, glare, low light, and motion blur make distant or weak targets easy to miss.\n\nFor judges, the key question is not whether the interface can present a model attractively, but whether the system solves a meaningful perception problem. Argus is positioned around that problem first: reliable detection when visual evidence is incomplete, unstable, or easily overwhelmed by the scene.',
    caption: 'Problem framing / evaluation context / why the task matters',
    align: 'right',
    variant: 'hero',
    metrics: [
      { value: 'All-weather', label: 'Target scenario' },
      { value: 'Small objects', label: 'Core challenge' },
    ],
  },
  {
    id: 'section-detail',
    nav: '02',
    backgroundLabel: 'Method',
    label: 'Method',
    eyebrow: 'Technical Approach',
    title: 'The method combines multiple sensing cues so detection does not depend on a single fragile visual stream.',
    description:
      'Argus is designed as a multimodal perception pipeline. Instead of trusting one camera view under changing weather, it aligns complementary signals and uses them jointly to recover small targets that are weak, partially occluded, or easily buried in background noise.\n\nThis section should help a reviewer understand the contribution quickly: the work is about robustness, fusion, and traffic-scene perception under adverse conditions, not just a visually polished 3D presentation.',
    caption: 'Multimodal fusion / robustness strategy / technical contribution',
    align: 'left',
    variant: 'method',
    metrics: [
      { value: 'Multimodal', label: 'Input strategy' },
      { value: 'Robustness', label: 'Design priority' },
    ],
  },
  {
    id: 'section-emotion',
    nav: '03',
    backgroundLabel: 'Outcome',
    label: 'Result',
    eyebrow: 'Evaluation Focus',
    title: 'What matters in the final review is whether the system stays credible when the scene becomes difficult.',
    description:
      'The outcome should be judged on evidence: clearer target recovery, more stable perception under adverse weather, and stronger practical value for traffic scenarios where missed detections carry real cost.\n\nThis final narrative beat should leave judges with a precise conclusion. Argus is not only a concept demo; it is a research system built to improve detection reliability in conditions where conventional approaches are least dependable.',
    caption: 'Expected evidence / application value / final takeaway',
    align: 'right',
    variant: 'outcome',
    metrics: [
      { value: 'Traffic scenes', label: 'Application domain' },
      { value: 'Reliable detection', label: 'Review standard' },
    ],
  },
]

const navigationItems = [
  ...sections.map(({ id, nav, label, eyebrow }) => ({ id, nav, label, eyebrow })),
  {
    id: 'section-demo-video',
    nav: '04',
    label: 'Demo',
    eyebrow: 'System Evidence',
  },
]

const currentStepLabel = computed(() => {
  const activeItem = navigationItems.find((item) => item.id === currentSection.value)
  if (!activeItem) {
    return 'Scroll to navigate'
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
    const scrollHint = pageRef.value.querySelector('.showcase-scroll-hint')
    const sectionNodes = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)
    const copies = gsap.utils.toArray('.story-copy')
    const backgroundWords = gsap.utils.toArray('.story-section__background')
    const launchSection = document.getElementById('section-launch')
    const launchCopy = launchSection?.querySelector('.story-copy')
    const launchBackground = launchSection?.querySelector('.story-section__background')

    gsap.set([scrollHint], { autoAlpha: 0, y: 24 })
    gsap.set(copies, { autoAlpha: 0, y: 72 })
    gsap.set(backgroundWords, { autoAlpha: 0, yPercent: 14 })

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .add(playIntro(), 0)
      .to(launchCopy, { autoAlpha: 1, y: 0, duration: 1.05 }, 2.7)
      .to(launchBackground, { autoAlpha: 0.72, yPercent: 0, duration: 1.15 }, 2.8)
      .to(scrollHint, { autoAlpha: 1, y: 0, duration: 2.6 }, 1.05)

    const overviewSection = document.getElementById('section-launch')
    const detailSection = document.getElementById('section-detail')
    const emotionSection = document.getElementById('section-emotion')
    const demoSection = document.getElementById('section-demo-video')

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

    if (demoSection) {
      ScrollTrigger.create({
        trigger: demoSection,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => setCurrentSection('section-demo-video'),
        onEnterBack: () => setCurrentSection('section-demo-video'),
      })
    }

    sectionNodes.forEach((section) => {
      const copy = section.querySelector('.story-copy')
      const background = section.querySelector('.story-section__background')

      if (section.id === 'section-launch') {
        return
      }

      if (copy) {
        const isDetailSection = section.id === 'section-detail'

        if (isDetailSection) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                end: 'bottom 42%',
                scrub: 0.58,
              },
            })
            .fromTo(
              copy,
              { autoAlpha: 0, y: 96 },
              { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.48 },
            )
            .to(copy, {
              autoAlpha: 1,
              y: 0,
              ease: 'none',
              duration: 0.24,
            })
        } else {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 0.64,
              },
            })
            .fromTo(
              copy,
              { autoAlpha: 0, y: 72 },
              { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.34 },
            )
            .to(copy, {
              autoAlpha: 0.18,
              y: -36,
              ease: 'power2.inOut',
              duration: 0.42,
            })
        }
      }

      if (background) {
  const isDetailSection = section.id === 'section-detail'

  if (isDetailSection) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          end: 'bottom 40%',
          scrub: 0.6,
        },
      })
      .fromTo(
        background,
        { autoAlpha: 0, yPercent: 18 },
        { autoAlpha: 0.92, yPercent: 0, ease: 'power2.out', duration: 0.4 },
      )
      .to(background, {
        autoAlpha: 0.38,
        yPercent: -6,
        ease: 'power2.inOut',
        duration: 0.32,
      })
  } else {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 76%',
          end: 'bottom 32%',
          scrub: 0.66,
        },
      })
      .fromTo(
        background,
        { autoAlpha: 0, yPercent: 14 },
        { autoAlpha: 0.78, yPercent: 0, ease: 'power2.out', duration: 0.36 },
      )
      .to(background, {
        autoAlpha: 0.12,
        yPercent: -10,
        ease: 'power2.inOut',
        duration: 0.34,
      })
  }
}

    })

    gsap.to('.showcase-scroll-hint__line', {
      yPercent: 120,
      repeat: -1,
      duration: 1.3,
      ease: 'power1.inOut',
      yoyo: true,
    })

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
  font-size: 0.6875rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.drone-showcase__content {
  position: relative;
  z-index: 2;
}

.demo-video-section {
  position: relative;
  min-height: 140vh;
  display: flex;
  align-items: center;
  padding: 14vh 0 18vh;
}

.demo-video-section__inner {
  width: min(1440px, calc(100% - 72px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 0.75fr) minmax(0, 1.45fr);
  gap: 48px;
  align-items: start;
}

.demo-video-section__copy {
  position: sticky;
  top: 128px;
  display: grid;
  gap: 18px;
}

.demo-video-section__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.demo-video-section__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-weight: 700;
  font-size: clamp(34px, 4.8vw, 72px);
  line-height: 1;
  letter-spacing: -0.045em;
  color: var(--showcase-title);
  text-wrap: balance;
}

.demo-video-section__body {
  margin: 0;
  max-width: 34ch;
  font-size: 1rem;
  line-height: 1.92;
  font-family: var(--argus-font-body);
  font-weight: 500;
  color: var(--showcase-body);
}

.demo-video-frame {
  min-height: 72vh;
  border-top: 1px solid var(--showcase-card-border);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
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
  font-size: 0.6875rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.demo-video-frame__hint {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.85;
  font-family: var(--argus-font-body);
  font-weight: 500;
}

.demo-video-frame__path {
  justify-self: center;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.875rem;
  font-family: var(--argus-font-body);
  font-weight: 600;
  color: var(--showcase-title);
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
    padding: 12vh 0 16vh;
  }

  .demo-video-section__inner {
    width: min(100%, calc(100% - 32px));
    grid-template-columns: 1fr;
    gap: 26px;
  }

  .demo-video-section__copy {
    position: static;
  }

  .demo-video-frame,
  .demo-video-frame__media,
  .demo-video-frame__placeholder {
    min-height: 48vh;
  }
}
</style>
