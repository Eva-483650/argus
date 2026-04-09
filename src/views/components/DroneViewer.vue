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

    <nav class="showcase-sidebar" aria-label="Section navigation">
      <button
        v-for="section in sections"
        :key="section.id"
        class="showcase-dot"
        :data-target="section.id"
        type="button"
        @click="scrollToSection(section.id)"
      >
        <span class="showcase-dot__bullet"></span>
        <span class="showcase-dot__label">{{ section.nav }}</span>
      </button>
    </nav>

    <div class="showcase-scroll-hint">
      <span class="showcase-scroll-hint__line"></span>
      <span class="showcase-scroll-hint__text">Scroll to navigate</span>
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
      />
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

const sections = [
  {
    id: 'section-launch',
    nav: '01',
    backgroundLabel: 'Overview',
    eyebrow: 'Launch Sequence',
    title: 'One drone. Three camera languages. One continuous scroll story.',
    description:
      'The opening shot establishes the silhouette. The drone starts oversized in the lower-left foreground, takes a wide orbital path, and settles into the hero framing.\n\nCopy, side navigation, and the scroll hint are part of the same visual system instead of a separate overlay layer.',
    caption: 'Intro flight path / hero copy / side navigation',
    align: 'right',
    metrics: [
      { value: '42 mm', label: 'Field of view' },
      { value: '4.8 s', label: 'Intro duration' },
    ],
  },
  {
    id: 'section-detail',
    nav: '02',
    backgroundLabel: 'Detail',
    eyebrow: 'Precision Orbit',
    title: 'The second screen switches to a structural rail and tighter framing.',
    description:
      'Scroll drives a new camera track. The drone changes posture, shifts laterally, and reveals rotor, arm, and gimbal relationships with a more technical rhythm.',
    caption: 'Camera rail / rotation shift / metal polish',
    align: 'left',
    metrics: [
      { value: '3-axis', label: 'Gimbal system' },
      { value: '12 km', label: 'Transmission range' },
    ],
  },
  {
    id: 'section-emotion',
    nav: '03',
    backgroundLabel: 'Emotion',
    eyebrow: 'Emotional Close-up',
    title: 'The third screen becomes a restrained close-up with controlled tension.',
    description:
      'The camera pushes closer, the pose becomes more deliberate, and the material tone shifts with the light. The DOM layer and the WebGL layer stay locked together.',
    caption: 'Close framing / surface shift / synchronized storytelling',
    align: 'right',
    metrics: [
      { value: '0.12 s', label: 'Response time' },
      { value: '360 deg', label: 'Spatial awareness' },
    ],
  },
]

let context
let refreshHandler

const scrollToSection = (id) => {
  const target = document.getElementById(id)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const setupExperience = ({ sceneState, handleResize, playIntro }) => {
  if (!pageRef.value || context) return

  context = gsap.context(() => {
    const sidebar = pageRef.value.querySelector('.showcase-sidebar')
    const scrollHint = pageRef.value.querySelector('.showcase-scroll-hint')
    const dots = gsap.utils.toArray('.showcase-dot')
    const sectionNodes = sections.map((section) => document.getElementById(section.id)).filter(Boolean)
    const copies = gsap.utils.toArray('.story-copy')
    const backgroundWords = gsap.utils.toArray('.story-section__background')

    gsap.set([sidebar, scrollHint], { autoAlpha: 0, y: 24 })
    gsap.set(copies, { autoAlpha: 0, y: 72 })
    gsap.set(backgroundWords, { autoAlpha: 0, yPercent: 14 })

    gsap
      .timeline({ defaults: { ease: 'power4.out' } })
      .add(playIntro(), 0)
      .to(sidebar, { autoAlpha: 1, y: 0, duration: 3.8 }, 1.25)
      .to(scrollHint, { autoAlpha: 1, y: 0, duration: 4.1 }, 1.6)

    const overviewSection = document.getElementById('section-launch')
    const detailSection = document.getElementById('section-detail')
    const emotionSection = document.getElementById('section-emotion')

    if (overviewSection) {
      gsap.timeline({
        scrollTrigger: {
          trigger: overviewSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      }).to(sceneState, { overview: 1, ease: 'none' })
    }

    if (detailSection) {
      gsap.timeline({
        scrollTrigger: {
          trigger: detailSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.25,
        },
      })
        .to(sceneState, { detail: 1, ease: 'none' })
        .to(sceneState, { overview: 0.68, ease: 'none' }, 0)
    }

    if (emotionSection) {
      gsap.timeline({
        scrollTrigger: {
          trigger: emotionSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.3,
        },
      })
        .to(sceneState, { emotion: 1, ease: 'none' })
        .to(sceneState, { detail: 0.86, ease: 'none' }, 0)
    }

    sectionNodes.forEach((section, index) => {
      const copy = section.querySelector('.story-copy')
      const background = section.querySelector('.story-section__background')
      const dot = dots[index]

      if (copy) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.9,
            },
          })
          .fromTo(
            copy,
            { autoAlpha: 0, y: 72 },
            { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.45 },
          )
          .to(copy, {
            autoAlpha: 0.18,
            y: -36,
            ease: 'power2.inOut',
            duration: 0.55,
          })
      }

      if (background) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 76%',
              end: 'bottom 32%',
              scrub: 0.9,
            },
          })
          .fromTo(
            background,
            { autoAlpha: 0, yPercent: 14 },
            { autoAlpha: 0.78, yPercent: 0, ease: 'power2.out', duration: 0.5 },
          )
          .to(background, {
            autoAlpha: 0.12,
            yPercent: -10,
            ease: 'power2.inOut',
            duration: 0.5,
          })
      }

      if (dot) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          toggleClass: { targets: dot, className: 'is-active' },
        })
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
.drone-showcase {
  --showcase-bg: transparent;
  --showcase-title: #f5f8fc;
  --showcase-body: rgba(220, 229, 238, 0.84);
  --showcase-caption: rgba(177, 194, 210, 0.68);
  --showcase-accent: #84d6ff;
  --showcase-accent-soft: rgba(132, 214, 255, 0.78);
  --showcase-card-top: rgba(255, 255, 255, 0.12);
  --showcase-card-bottom: rgba(96, 118, 255, 0.03);
  --showcase-card-base: rgba(6, 11, 22, 0.34);
  --showcase-card-border: rgba(129, 159, 255, 0.16);
  --showcase-card-shadow: rgba(0, 0, 0, 0.12);
  --showcase-metric-border: rgba(255, 255, 255, 0.11);
  --showcase-ghost: rgba(170, 198, 255, 0.08);
  --showcase-dot: rgba(122, 153, 255, 0.2);
  --showcase-dot-active: #dff3ff;
  --showcase-dot-text: rgba(208, 220, 232, 0.72);
  --showcase-mesh: rgba(128, 162, 255, 0.05);
  --showcase-hint: rgba(214, 226, 238, 0.76);
  position: relative;
  min-height: 360vh;
  overflow: clip;
  background: var(--showcase-bg);
  color: var(--showcase-title);
}

.theme-light {
  --showcase-bg: transparent;
  --showcase-title: #102033;
  --showcase-body: rgba(42, 61, 83, 0.82);
  --showcase-caption: rgba(76, 98, 124, 0.76);
  --showcase-accent: #506cff;
  --showcase-accent-soft: rgba(80, 108, 255, 0.72);
  --showcase-card-top: rgba(255, 255, 255, 0.72);
  --showcase-card-bottom: rgba(232, 238, 255, 0.42);
  --showcase-card-base: rgba(255, 255, 255, 0.34);
  --showcase-card-border: rgba(80, 108, 255, 0.16);
  --showcase-card-shadow: rgba(104, 127, 156, 0.08);
  --showcase-metric-border: rgba(122, 143, 170, 0.22);
  --showcase-ghost: rgba(38, 62, 122, 0.09);
  --showcase-dot: rgba(38, 62, 122, 0.16);
  --showcase-dot-active: #102033;
  --showcase-dot-text: rgba(44, 63, 85, 0.76);
  --showcase-mesh: rgba(16, 32, 51, 0.05);
  --showcase-hint: rgba(52, 73, 98, 0.76);
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
.showcase-sidebar,
.showcase-scroll-hint {
  position: relative;
  z-index: 2;
}

.drone-showcase__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(110px);
  opacity: 0.34;
}

.drone-showcase__orb--a {
  top: 10%;
  left: -10%;
  width: 42vw;
  height: 42vw;
  background: rgba(41, 242, 255, 0.18);
}

.drone-showcase__orb--b {
  right: -8%;
  bottom: 8%;
  width: 34vw;
  height: 34vw;
  background: rgba(109, 94, 255, 0.16);
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

.showcase-sidebar {
  position: fixed;
  top: 50%;
  right: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transform: translateY(-50%);
}

.showcase-dot {
  border: 0;
  padding: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--showcase-dot-text);
}

.showcase-dot__bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--showcase-dot);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition:
    transform 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.showcase-dot__label {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.showcase-dot.is-active .showcase-dot__bullet,
.showcase-dot:hover .showcase-dot__bullet {
  transform: scale(1.25);
  background: var(--showcase-dot-active);
  box-shadow: 0 0 18px rgba(138, 193, 255, 0.4);
}

.showcase-dot.is-active .showcase-dot__label,
.showcase-dot:hover .showcase-dot__label {
  color: var(--showcase-title);
}

.showcase-scroll-hint {
  position: fixed;
  left: min(7vw, 88px);
  bottom: 42px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--showcase-hint);
}

.showcase-scroll-hint__line {
  width: 1px;
  height: 48px;
  background: linear-gradient(180deg, transparent, currentColor, transparent);
}

.showcase-scroll-hint__text {
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.drone-showcase__content {
  position: relative;
  z-index: 2;
}

@media (max-width: 960px) {
  .drone-showcase {
    min-height: 390vh;
  }

  .showcase-sidebar {
    right: 16px;
  }

  .showcase-dot__label {
    display: none;
  }

  .showcase-scroll-hint {
    left: 20px;
    bottom: 20px;
  }
}
</style>
