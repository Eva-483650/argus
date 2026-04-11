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
              <span class="demo-video-frame__badge">Demo Placeholder</span>
              <p class="demo-video-frame__hint">Add the final evaluation video here so judges can verify the method on a complete driving sequence.</p>
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

const demoAct = {
  id: 'section-demo-video',
  nav: '04',
  backgroundLabel: 'Demo',
  label: 'Demo',
  eyebrow: 'System Evidence',
  caption: 'Full-sequence validation / multimodal pipeline / reviewer proof layer',
  title: 'See the full pipeline operate on a complete traffic sequence.',
  description:
    'This final act should convert the narrative into verification. Show the end-to-end run here: multimodal input, adverse-weather behavior, small-object recovery, and the system response in a realistic driving scene so judges can inspect the evidence directly.',
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
