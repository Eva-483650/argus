<template>
  <main ref="pageRef" class="downloads-view" :class="`theme-${themeMode}`">
    <section class="downloads-page">
      <header class="downloads-hero">
        <p class="downloads-hero__eyebrow">项目资源</p>
        <div class="downloads-hero__main">
          <h1 class="downloads-hero__title">资料下载</h1>
          <p class="downloads-hero__intro">
            这里提供 Argus 项目的源码访问入口，目的是让评审能够从展示叙事快速过渡到实际实现，尽量高效地查看项目结构与技术细节。
          </p>
        </div>
      </header>

      <section class="downloads-access" aria-labelledby="downloads-access-title">
        <div class="downloads-access__rail" aria-hidden="true">
          <span class="downloads-access__index">01</span>
        </div>

        <div class="downloads-access__content">
          <p class="downloads-access__eyebrow">公开仓库</p>
          <h2 id="downloads-access-title" class="downloads-access__title">GitHub 源码仓库</h2>
          <p class="downloads-access__body">
            打开当前 Argus 源码仓库，即可查看前端界面、研究展示流程，以及公开站点背后的具体实现细节。
          </p>
        </div>

        <div class="downloads-access__actions">
          <a
            class="downloads-button downloads-button--primary"
            :href="repositoryUrl"
            target="_blank"
            rel="noreferrer"
          >
            打开仓库
          </a>
          <p class="downloads-access__path">{{ repositoryLabel }}</p>
        </div>
      </section>

      <section class="downloads-outline" aria-label="可查看资料">
        <div v-for="item in resources" :key="item.label" class="downloads-outline__row">
          <span class="downloads-outline__label">{{ item.label }}</span>
          <p class="downloads-outline__value">{{ item.value }}</p>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const injectedTheme = inject('argusTheme', ref(true))
const themeMode = computed(() => (injectedTheme.value ? 'dark' : 'light'))
const pageRef = ref(null)

let context

const repositoryUrl = 'https://github.com/Eva-483650/argus'
const repositoryLabel = repositoryUrl.replace(/^https?:\/\//, '')

const resources = [
  {
    label: '当前公开内容',
    value: '包含站点源码、研究展示流程以及公开页面对应的实现代码。',
  },
  {
    label: '仓库范围',
    value: '涵盖前端视图、主题系统，以及驱动研究展示页体验的 3D 展示逻辑。',
  },
  {
    label: '建议查看路径',
    value: '建议先从研究展示页了解叙事背景，再进入仓库查看实现细节与代码结构。',
  },
]

onMounted(() => {
  if (!pageRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  context = gsap.context(() => {
    const hero = pageRef.value.querySelector('.downloads-hero')
    const heroEyebrow = hero?.querySelector('.downloads-hero__eyebrow')
    const heroTitle = hero?.querySelector('.downloads-hero__title')
    const heroIntro = hero?.querySelector('.downloads-hero__intro')
    const heroMain = hero?.querySelector('.downloads-hero__main')
    const access = pageRef.value.querySelector('.downloads-access')
    const accessRail = access?.querySelector('.downloads-access__rail')
    const accessEyebrow = access?.querySelector('.downloads-access__eyebrow')
    const accessTitle = access?.querySelector('.downloads-access__title')
    const accessBody = access?.querySelector('.downloads-access__body')
    const accessButton = access?.querySelector('.downloads-button')
    const accessPath = access?.querySelector('.downloads-access__path')
    const outlineRows = gsap.utils.toArray('.downloads-outline__row')

    gsap
      .timeline({
        defaults: {
          ease: 'power3.out',
        },
      })
      .fromTo(heroEyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.58 })
      .fromTo(heroTitle, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.78 }, 0.1)
      .fromTo(heroIntro, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.72 }, 0.24)

    if (heroMain) {
      gsap.to(heroMain, {
        yPercent: -2,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    }

    if (access) {
      gsap
        .timeline({
          defaults: {
            ease: 'power3.out',
          },
          scrollTrigger: {
            trigger: access,
            start: 'top 76%',
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(accessRail, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.54 })
        .fromTo(
          [accessEyebrow, accessTitle],
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.1 },
          0.12,
        )
        .fromTo(accessBody, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.64 }, 0.3)
        .fromTo(
          accessButton,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.56 },
          0.44,
        )
        .fromTo(accessPath, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.54 }, 0.58)
    }

    outlineRows.forEach((row, index) => {
      const label = row.querySelector('.downloads-outline__label')
      const value = row.querySelector('.downloads-outline__value')

      gsap
        .timeline({
          defaults: {
            ease: 'power3.out',
          },
          scrollTrigger: {
            trigger: row,
            start: 'top 84%',
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(label, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
        .fromTo(value, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.12)

      gsap.to(row, {
        yPercent: index % 2 === 0 ? -1.4 : -0.8,
        ease: 'none',
        scrollTrigger: {
          trigger: row,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })
  }, pageRef)
})

onBeforeUnmount(() => {
  context?.revert()
})
</script>

<style scoped>
.downloads-view {
  --downloads-space-xs: 0.75rem;
  --downloads-space-sm: 1rem;
  --downloads-space-md: 1.5rem;
  --downloads-space-lg: 2rem;
  --downloads-space-xl: clamp(3rem, 6vw, 5rem);
  min-height: calc(100vh - 56px);
  padding: 40px 24px 80px;
  font-family: var(--argus-font-body);
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  font-kerning: normal;
}

.downloads-page {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
}

.downloads-page::before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  margin-bottom: var(--downloads-space-xl);
  background: linear-gradient(90deg, transparent, var(--downloads-divider), transparent);
}

.downloads-hero {
  display: grid;
  gap: var(--downloads-space-md);
  margin-bottom: clamp(2.5rem, 7vw, 5.5rem);
}

.downloads-hero__eyebrow {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--downloads-eyebrow);
}

.downloads-hero__main {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(320px, 0.92fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: end;
}

.downloads-hero__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: var(--argus-type-display-xl);
  font-weight: var(--argus-weight-regular);
  line-height: var(--argus-leading-display-xl);
  letter-spacing: var(--argus-tracking-display);
  color: var(--downloads-title);
  text-wrap: balance;
}

.downloads-hero__intro {
  max-width: 42ch;
  margin: 0;
  font-size: var(--argus-type-body-lg);
  line-height: var(--argus-leading-body-lg);
  color: var(--downloads-copy);
  text-wrap: pretty;
}

.downloads-access {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) minmax(220px, 280px);
  gap: clamp(1.25rem, 4vw, 3rem);
  align-items: start;
  padding: clamp(2rem, 5vw, 3.5rem) 0;
  border-top: 1px solid var(--downloads-line);
  border-bottom: 1px solid var(--downloads-line);
}

.downloads-access__rail {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px;
}

.downloads-access__index {
  font-size: var(--argus-type-accent-display);
  line-height: var(--argus-leading-accent-display);
  font-family: var(--argus-font-display);
  font-weight: var(--argus-weight-regular);
  letter-spacing: var(--argus-tracking-accent-display);
  color: var(--downloads-accent);
}

.downloads-access__content {
  display: grid;
  gap: 14px;
}

.downloads-access__eyebrow {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--downloads-eyebrow);
}

.downloads-access__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: var(--argus-type-accent-display);
  font-weight: var(--argus-weight-regular);
  line-height: var(--argus-leading-accent-display);
  letter-spacing: var(--argus-tracking-accent-display);
  color: var(--downloads-heading);
}

.downloads-access__body {
  max-width: 56ch;
  margin: 0;
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  color: var(--downloads-copy);
  text-wrap: pretty;
}

.downloads-access__actions {
  display: grid;
  gap: 14px;
  justify-items: start;
  align-content: start;
  will-change: transform, opacity;
}

.downloads-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: var(--argus-type-nav);
  line-height: var(--argus-leading-nav);
  font-weight: var(--argus-weight-medium);
  letter-spacing: 0.02em;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.downloads-button:hover {
  transform: translateY(-1px);
}

.downloads-button:focus-visible {
  outline: 2px solid var(--downloads-accent);
  outline-offset: 3px;
}

.downloads-button--primary {
  background: var(--downloads-button-bg);
  color: var(--downloads-button-text);
  box-shadow: 0 14px 30px var(--downloads-button-shadow);
}

.downloads-access__path {
  margin: 0;
  font-size: var(--argus-type-meta);
  font-weight: var(--argus-weight-regular);
  line-height: var(--argus-leading-meta);
  color: var(--downloads-path);
  overflow-wrap: anywhere;
  word-break: normal;
}

.downloads-outline {
  display: grid;
}

.downloads-outline__row {
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 2.25rem);
  align-items: start;
  padding: 22px 0;
  border-bottom: 1px solid var(--downloads-line-soft);
  will-change: transform, opacity;
}

.downloads-outline__label {
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--downloads-meta-label);
}

.downloads-outline__value {
  max-width: 62ch;
  margin: 0;
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  color: var(--downloads-copy);
  text-wrap: pretty;
}

.theme-dark {
  --downloads-eyebrow: rgba(200, 168, 106, 0.82);
  --downloads-title: #f4efe5;
  --downloads-heading: #f4efe5;
  --downloads-copy: rgba(222, 219, 210, 0.82);
  --downloads-divider: rgba(200, 168, 106, 0.18);
  --downloads-line: rgba(200, 168, 106, 0.1);
  --downloads-line-soft: rgba(200, 168, 106, 0.08);
  --downloads-meta-label: rgba(174, 171, 164, 0.72);
  --downloads-accent: #c8a86a;
  --downloads-button-bg: linear-gradient(135deg, #c8a86a, #b78b43);
  --downloads-button-text: #101724;
  --downloads-button-shadow: rgba(200, 168, 106, 0.18);
  --downloads-path: rgba(210, 205, 194, 0.74);
}

.theme-light {
  --downloads-eyebrow: rgba(183, 139, 67, 0.74);
  --downloads-title: #1d2430;
  --downloads-heading: #1d2430;
  --downloads-copy: rgba(56, 61, 69, 0.82);
  --downloads-divider: rgba(183, 139, 67, 0.18);
  --downloads-line: rgba(183, 139, 67, 0.14);
  --downloads-line-soft: rgba(183, 139, 67, 0.12);
  --downloads-meta-label: rgba(98, 102, 108, 0.74);
  --downloads-accent: #b78b43;
  --downloads-button-bg: linear-gradient(135deg, #c59b4f, #b78b43);
  --downloads-button-text: #1d2430;
  --downloads-button-shadow: rgba(183, 139, 67, 0.16);
  --downloads-path: rgba(88, 84, 77, 0.76);
}

@media (max-width: 980px) {
  .downloads-hero__main {
    grid-template-columns: 1fr;
  }

  .downloads-access {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .downloads-access__actions {
    grid-column: 2;
  }
}

@media (max-width: 720px) {
  .downloads-view {
    padding: 24px 16px 48px;
  }

  .downloads-page::before {
    margin-bottom: 2.5rem;
  }

  .downloads-access {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 28px 0;
  }

  .downloads-access__rail {
    justify-content: flex-start;
  }

  .downloads-access__actions {
    grid-column: auto;
  }

  .downloads-outline__row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 18px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .downloads-access__actions,
  .downloads-outline__row {
    will-change: auto;
  }
}
</style>
