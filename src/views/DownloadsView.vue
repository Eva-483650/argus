<template>
  <main ref="pageRef" class="downloads-view" :class="`theme-${themeMode}`">
    <section class="downloads-shell">
      <header class="downloads-hero">
        <p class="downloads-kicker">Official Repository</p>
        <div class="downloads-hero__main">
          <div class="downloads-hero__heading">
            <h1 class="downloads-hero__title">RegisterMM</h1>
            <p class="downloads-hero__subtitle">多模态目标检测的轻量公开项目页</p>
          </div>

          <p class="downloads-hero__intro">
            RegisterMM 当前作为项目的官方公开仓库页面，对外提供方法概览、定性可视化结果与项目说明。
            完整仓库内容，包括训练代码、推理代码、检查点和评测脚本，将在论文接收后统一发布。
          </p>
        </div>

        <div class="downloads-hero__meta" aria-label="project tags">
          <span v-for="tag in heroTags" :key="tag">{{ tag }}</span>
        </div>
      </header>

      <section class="downloads-brief" aria-labelledby="downloads-access-title">
        <div class="downloads-section-mark" aria-hidden="true">01</div>

        <div class="downloads-brief__main">
          <p class="downloads-kicker">Repository Access</p>
          <h2 id="downloads-access-title" class="downloads-section-title">GitHub 仓库入口</h2>
          <p class="downloads-body">
            该页面现已改为指向 RegisterMM 的官方仓库。当前公开内容以研究展示和方法说明为主，
            适合快速了解课题方向、核心模块组成和阶段性发布范围。
          </p>
          <p class="downloads-brief__status">{{ repositoryStatus }}</p>
        </div>

        <div class="downloads-brief__aside">
          <a
            class="downloads-button downloads-button--primary"
            :href="repositoryUrl"
            target="_blank"
            rel="noreferrer"
          >
            打开 GitHub 仓库
          </a>
          <p class="downloads-brief__path">{{ repositoryLabel }}</p>
        </div>
      </section>

      <section class="downloads-editorial" aria-label="project overview and release status">
        <article class="downloads-editorial__overview">
          <p class="downloads-kicker">Overview</p>
          <h2 class="downloads-section-title">当前公开内容定位</h2>
          <p class="downloads-body">
            仓库现阶段是一个轻量级公开项目页，围绕多模态 RGB-IR / RGB-Thermal 目标检测任务展示
            RegisterMM 的研究方向与核心方法。
          </p>
          <p class="downloads-body">
            页面重点不是提供完整复现环境，而是先公开方法框架、代表性可视化与项目摘要，
            让读者在论文正式接收前先建立对整体技术路线的理解。
          </p>
        </article>

        <article class="downloads-editorial__release">
          <p class="downloads-kicker">Release Status</p>
          <h2 class="downloads-section-title">已公开与后续发布</h2>
          <p class="downloads-body downloads-editorial__summary">
            当前仓库承担的是公开说明页角色，适合先看方法与样例；真正用于训练、推理和评测的完整工程，
            会在论文接收后再统一开放。
          </p>

          <div class="downloads-release">
            <div class="downloads-release__group">
              <span class="downloads-release__label">Currently Available</span>
              <ul class="downloads-list">
                <li v-for="item in publicAssets" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div class="downloads-release__group">
              <span class="downloads-release__label">Planned After Acceptance</span>
              <ul class="downloads-list">
                <li v-for="item in futureAssets" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </article>
      </section>



      <section class="downloads-method" aria-labelledby="downloads-method-title">
        <div class="downloads-method__head">
          <p class="downloads-kicker">Method Overview</p>
          <h2 id="downloads-method-title" class="downloads-section-title">RegisterMM 方法流程</h2>
          <p class="downloads-body downloads-method__intro">
            由于当前页面未附原始总览图，这里用结构化流程段落把论文中的主干思路展开，
            方便在站内快速阅读。
          </p>
        </div>

        <ol class="downloads-method__flow" aria-label="method pipeline">
          <li v-for="step in methodSteps" :key="step.stage" class="downloads-method__step">
            <span class="downloads-method__stage">{{ step.stage }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </li>
        </ol>
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

let context = null

const repositoryUrl = 'https://github.com/wangzian828/registerMM'
const repositoryLabel = repositoryUrl.replace(/^https?:\/\//, '')
const repositoryStatus =
  'Code, checkpoints, and training scripts will be released after paper acceptance.'

const heroTags = [
  'Multimodal RGB-IR / RGB-Thermal object detection',
  'Dual-stream DINOv3S encoder',
  'RWPR-based cross-modal interaction',
  'RT-DETR based detection head',
]

const publicAssets = [
  'Method overview figures',
  'Selected qualitative visualizations',
  'Project description',
]

const futureAssets = ['Training code', 'Inference code', 'Checkpoints', 'Evaluation scripts']

const highlights = [
  {
    title: 'Multimodal RGB-IR / RGB-Thermal object detection',
    description:
      '面向可见光与红外 / 热成像联合建模，在复杂照明和跨模态信息不均衡场景下提升检测鲁棒性。',
  },
  {
    title: 'Dual-stream DINOv3S encoder',
    description:
      '以双流编码器分别提取不同模态的表征，在保持独立特征表达的同时为后续交互提供稳定主干。',
  },
  {
    title: 'RWPR-based cross-modal interaction',
    description: '通过 RWPR 机制执行跨模态信息交互，强化两路特征之间的补充关系而非简单拼接。',
  },
  {
    title: 'RCRS refinement',
    description: '在交互之后执行细化步骤，进一步整理跨模态响应，降低错配噪声对检测结果的影响。',
  },
  {
    title: 'Residual-concat multi-scale fusion',
    description: '结合残差与拼接式多尺度融合，使浅层细节与深层语义能够更平衡地进入检测阶段。',
  },
  {
    title: 'RG-PADI detail enhancement',
    description: '增强目标边界与局部细节表达，改善小目标、模糊目标和复杂背景区域的辨识能力。',
  },
  {
    title: 'RT-DETR based detection head',
    description:
      '最终检测头基于 RT-DETR 构建，使整体框架具备端到端检测效率与更直接的目标定位输出。',
  },
]

const methodSteps = [
  {
    stage: 'Step 01',
    title: 'RGB + IR / Thermal Inputs',
    description: '从可见光与红外 / 热成像两路输入同步接收场景信息，保留模态差异。',
  },
  {
    stage: 'Step 02',
    title: 'Dual-stream DINOv3S Encoder',
    description: '双流主干分别提取各自模态的层级特征，为跨模态融合保留独立表示空间。',
  },
  {
    stage: 'Step 03',
    title: 'RWPR Cross-modal Interaction',
    description: '利用 RWPR 机制建立跨模态响应联系，让两路特征在关键区域完成有效互补。',
  },
  {
    stage: 'Step 04',
    title: 'RCRS Refinement',
    description: '对交互后的中间表征进一步精炼，抑制噪声并修正局部不稳定响应。',
  },
  {
    stage: 'Step 05',
    title: 'Residual-concat Multi-scale Fusion',
    description: '在多尺度层面执行残差与拼接混合融合，连接局部细节与高层语义。',
  },
  {
    stage: 'Step 06',
    title: 'RG-PADI Detail Enhancement',
    description: '强化边缘、纹理与局部显著性信息，为困难样本提供更清晰的判别依据。',
  },
  {
    stage: 'Step 07',
    title: 'RT-DETR Detection Head',
    description: '通过 RT-DETR 检测头输出最终结果，完成多模态目标检测的端到端预测。',
  },
]

onMounted(() => {
  if (!pageRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  context = gsap.context(() => {
    const heroKicker = pageRef.value.querySelector('.downloads-hero .downloads-kicker')
    const heroTitle = pageRef.value.querySelector('.downloads-hero__title')
    const heroSubtitle = pageRef.value.querySelector('.downloads-hero__subtitle')
    const heroIntro = pageRef.value.querySelector('.downloads-hero__intro')
    const heroTagsNode = pageRef.value.querySelector('.downloads-hero__meta')
    const sections = gsap.utils.toArray(
      pageRef.value.querySelectorAll(
        '.downloads-brief, .downloads-editorial, .downloads-highlights, .downloads-method',
      ),
    )
    const highlightRows = gsap.utils.toArray(pageRef.value.querySelectorAll('.downloads-highlight'))
    const methodStepsNodes = gsap.utils.toArray(
      pageRef.value.querySelectorAll('.downloads-method__step'),
    )

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(heroKicker, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.48 })
      .fromTo(heroTitle, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.68 }, 0.08)
      .fromTo(heroSubtitle, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.56 }, 0.16)
      .fromTo(heroIntro, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.68 }, 0.22)
      .fromTo(heroTagsNode, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.52 }, 0.3)

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    })

    highlightRows.forEach((row, index) => {
      gsap.fromTo(
        row,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.54,
          delay: index * 0.03,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    })

    methodStepsNodes.forEach((step, index) => {
      gsap.fromTo(
        step,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          delay: index * 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        },
      )
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
  --downloads-space-xl: clamp(3rem, 7vw, 5.5rem);
  --downloads-space-2xl: clamp(4rem, 10vw, 7rem);
  position: relative;
  min-height: calc(100vh - 56px);
  padding: 34px 24px 88px;
  color: var(--downloads-title);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', var(--argus-font-body), sans-serif;
  overflow: hidden;
}

.downloads-view::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: min(44vw, 28rem);
  background:
    radial-gradient(circle at 16% 0%, var(--downloads-glow), transparent 60%),
    radial-gradient(circle at 88% 8%, var(--downloads-glow-soft), transparent 52%);
  pointer-events: none;
}

.theme-dark.downloads-view {
  --downloads-title: #f3ede2;
  --downloads-copy: rgba(224, 219, 210, 0.86);
  --downloads-copy-soft: rgba(194, 187, 176, 0.76);
  --downloads-kicker: rgba(214, 181, 118, 0.86);
  --downloads-accent: #d6b576;
  --downloads-accent-strong: #e4c78a;
  --downloads-line: rgba(210, 181, 123, 0.16);
  --downloads-line-strong: rgba(210, 181, 123, 0.34);
  --downloads-divider: rgba(210, 181, 123, 0.12);
  --downloads-surface: rgba(10, 15, 23, 0.82);
  --downloads-surface-soft: rgba(15, 22, 33, 0.9);
  --downloads-shadow: rgba(0, 0, 0, 0.24);
  --downloads-button-text: #10161f;
  --downloads-glow: rgba(214, 181, 118, 0.11);
  --downloads-glow-soft: rgba(214, 181, 118, 0.06);
}

.theme-light.downloads-view {
  --downloads-title: #202732;
  --downloads-copy: rgba(49, 54, 61, 0.86);
  --downloads-copy-soft: rgba(91, 91, 88, 0.76);
  --downloads-kicker: rgba(168, 122, 52, 0.9);
  --downloads-accent: #c99c58;
  --downloads-accent-strong: #b87f2d;
  --downloads-line: rgba(171, 126, 57, 0.16);
  --downloads-line-strong: rgba(171, 126, 57, 0.32);
  --downloads-divider: rgba(171, 126, 57, 0.12);
  --downloads-surface: rgba(255, 252, 246, 0.9);
  --downloads-surface-soft: rgba(247, 240, 229, 0.96);
  --downloads-shadow: rgba(66, 54, 37, 0.08);
  --downloads-button-text: #1f2530;
  --downloads-glow: rgba(201, 156, 88, 0.14);
  --downloads-glow-soft: rgba(201, 156, 88, 0.08);
}

.downloads-shell {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  gap: var(--downloads-space-xl);
  z-index: 1;
}

.downloads-shell::before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--downloads-divider), transparent);
}

.downloads-kicker {
  margin: 0;
  color: var(--downloads-kicker);
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.downloads-section-head {
  display: grid;
  gap: 0.75rem;
}

.downloads-section-title {
  margin: 0;
  color: var(--downloads-title);
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', var(--argus-font-display), serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.downloads-body {
  max-width: 60ch;
  margin: 0;
  color: var(--downloads-copy);
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  text-wrap: pretty;
}

.downloads-hero {
  display: grid;
  gap: 1.5rem;
  padding-bottom: clamp(2.25rem, 5vw, 3.5rem);
  border-bottom: 1px solid var(--downloads-divider);
}

.downloads-hero__main {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(320px, 0.95fr);
  gap: clamp(1.25rem, 4vw, 3.5rem);
  align-items: end;
}

.downloads-hero__heading {
  display: grid;
  gap: 0.7rem;
}

.downloads-hero__title {
  margin: 0;
  color: var(--downloads-title);
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', var(--argus-font-display), serif;
  font-size: clamp(3.3rem, 8vw, 5.7rem);
  font-weight: 500;
  line-height: 0.96;
  letter-spacing: -0.045em;
}

.downloads-hero__subtitle {
  margin: 0;
  color: var(--downloads-copy-soft);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
}

.downloads-hero__intro {
  max-width: 42ch;
  margin: 0;
  color: var(--downloads-copy);
  font-size: var(--argus-type-body-lg);
  line-height: var(--argus-leading-body-lg);
  text-wrap: pretty;
}

.downloads-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  max-width: 72rem;
}

.downloads-hero__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--downloads-copy-soft);
  font-size: var(--argus-type-meta);
  line-height: 1.45;
}

.downloads-hero__meta span::before {
  content: '';
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--downloads-accent) 72%, transparent);
}

.downloads-section-mark {
  color: var(--downloads-accent);
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', var(--argus-font-display), serif;
  font-size: clamp(2.4rem, 4.6vw, 3.6rem);
  line-height: 0.92;
}

.downloads-brief,
.downloads-editorial,
.downloads-highlights,
.downloads-method {
  display: grid;
  gap: clamp(1.25rem, 4vw, 3.25rem);
  align-items: start;
  padding-bottom: clamp(2.5rem, 5vw, 3.75rem);
  border-bottom: 1px solid var(--downloads-divider);
}

.downloads-brief {
  grid-template-columns: 76px minmax(0, 1fr) minmax(250px, 320px);
}

.downloads-brief__main {
  display: grid;
  gap: 0.95rem;
}

.downloads-brief__aside {
  display: grid;
  gap: 0.9rem;
  align-content: start;
  justify-items: start;
  padding-top: 0.3rem;
}

.downloads-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 1.15rem;
  border: 1px solid color-mix(in srgb, var(--downloads-accent) 48%, transparent);
  background: color-mix(in srgb, var(--downloads-accent) 16%, transparent);
  color: var(--downloads-title);
  font-size: var(--argus-type-nav);
  line-height: var(--argus-leading-nav);
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.downloads-button:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--downloads-accent) 24%, transparent);
  border-color: color-mix(in srgb, var(--downloads-accent) 68%, transparent);
}

.downloads-button:focus-visible {
  outline: 2px solid var(--downloads-accent-strong);
  outline-offset: 3px;
}

.downloads-brief__path,
.downloads-brief__status {
  margin: 0;
  color: var(--downloads-copy-soft);
  font-size: var(--argus-type-meta);
  line-height: var(--argus-leading-meta);
}

.downloads-brief__path {
  overflow-wrap: anywhere;
}

.downloads-editorial {
  grid-template-columns: minmax(0, 0.94fr) minmax(320px, 0.82fr);
}

.downloads-editorial__overview,
.downloads-editorial__release {
  display: grid;
  gap: 1rem;
}

.downloads-editorial__release {
  padding-top: 0.25rem;
  padding-left: clamp(1rem, 2vw, 1.75rem);
  border-left: 1px solid var(--downloads-line);
}

.downloads-editorial__summary {
  max-width: 52ch;
}

.downloads-release {
  display: grid;
  gap: 1.2rem;
  margin-top: 0.35rem;
}

.downloads-release__group {
  display: grid;
  gap: 0.65rem;
  padding-top: 0.95rem;
  border-top: 1px solid var(--downloads-divider);
}

.downloads-release__label {
  color: var(--downloads-kicker);
  font-size: var(--argus-type-meta);
  line-height: 1.5;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.downloads-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1.15rem;
  color: var(--downloads-copy);
  font-size: var(--argus-type-body-base);
  line-height: 1.65;
}

.downloads-highlights {
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
}

.downloads-highlights__head,
.downloads-method__head {
  display: grid;
  gap: 0.85rem;
  align-content: start;
}

.downloads-highlights__list {
  display: grid;
  gap: 0;
}

.downloads-highlight {
  display: grid;
  grid-template-columns: 60px minmax(220px, 0.72fr) minmax(0, 1fr);
  gap: 0.85rem 1.5rem;
  padding: 1.15rem 0 1.35rem;
  border-top: 1px solid var(--downloads-divider);
  align-items: start;
}

.downloads-highlight:first-child {
  border-top: none;
  padding-top: 0;
}

.downloads-highlight__index {
  color: var(--downloads-accent);
  font-size: var(--argus-type-meta);
  line-height: 1.5;
  letter-spacing: 0.12em;
}

.downloads-highlight h3,
.downloads-method__step h3 {
  margin: 0;
  color: var(--downloads-title);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.35;
  font-weight: 600;
}

.downloads-highlight p,
.downloads-method__step p {
  max-width: 62ch;
  margin: 0;
  color: var(--downloads-copy);
  font-size: var(--argus-type-body-base);
  line-height: 1.65;
  text-wrap: pretty;
}

.downloads-method__intro {
  max-width: 58ch;
}

.downloads-method__flow {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.downloads-method__step {
  display: grid;
  grid-template-columns: 104px minmax(220px, 0.72fr) minmax(0, 1fr);
  gap: 0.85rem 1.5rem;
  padding: 1.1rem 0 1.35rem;
  border-top: 1px solid var(--downloads-divider);
  align-items: start;
}

.downloads-method__step:first-child {
  padding-top: 0;
  border-top: none;
}

.downloads-method__stage {
  color: var(--downloads-kicker);
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 1080px) {
  .downloads-hero__main,
  .downloads-editorial,
  .downloads-highlights,
  .downloads-method {
    grid-template-columns: 1fr;
  }

  .downloads-brief {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .downloads-brief__aside {
    grid-column: 2;
  }

  .downloads-editorial__release {
    padding-left: 0;
    border-left: none;
  }

  .downloads-highlight,
  .downloads-method__step {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .downloads-highlight p,
  .downloads-method__step p {
    grid-column: 2;
    max-width: 60ch;
  }
}

@media (max-width: 720px) {
  .downloads-view {
    padding: 24px 16px 54px;
  }

  .downloads-shell {
    gap: 1.25rem;
  }

  .downloads-hero {
    padding-bottom: 2rem;
  }

  .downloads-brief,
  .downloads-editorial,
  .downloads-highlights,
  .downloads-method {
    padding-bottom: 2.1rem;
  }

  .downloads-brief {
    grid-template-columns: 1fr;
  }

  .downloads-brief__aside {
    grid-column: auto;
    padding-top: 0;
  }

  .downloads-highlight,
  .downloads-method__step {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

  .downloads-highlight p,
  .downloads-method__step p {
    grid-column: auto;
  }

  .downloads-hero__title {
    font-size: clamp(2.6rem, 14vw, 4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .downloads-button {
    transition: none;
  }
}
</style>
