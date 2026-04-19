<template>
  <main ref="pageRef" class="team-view" :class="`theme-${themeMode}`">
    <section class="team-page">
      <header class="team-hero">
        <p class="team-hero__eyebrow">研究团队</p>
        <div class="team-hero__main">
          <h1 class="team-hero__title">团队成员</h1>
          <p class="team-hero__intro">
            Argus
            团队围绕算法设计、工程实现与成果展示协同推进项目，从问题建模、实验验证到网站呈现形成完整闭环，确保方案既有技术深度，也具备清晰有力的表达。
          </p>
        </div>
      </header>

      <section class="team-roster" aria-label="Argus 团队列表">
        <article
          v-for="(member, index) in members"
          :key="member.id"
          :id="member.id"
          class="team-member"
          :class="{ 'team-member--reverse': index % 2 === 1 }"
        >
          <div class="team-member__rail" aria-hidden="true">
            <span class="team-member__index">{{ member.index }}</span>
            <span class="team-member__rail-line"></span>
          </div>

          <figure class="team-member__media">
            <img
              v-if="member.photo"
              class="team-member__portrait"
              :src="member.photo"
              :alt="member.name"
            />

            <div v-else class="team-member__portrait team-member__portrait--placeholder">
              <span class="team-member__placeholder-index">{{ member.index }}</span>
              <small class="team-member__placeholder-note">照片待补充</small>
            </div>

            <figcaption class="team-member__media-caption">{{ member.imageHint }}</figcaption>
          </figure>

          <div class="team-member__content">
            <p class="team-member__role">{{ member.role }}</p>
            <h2 class="team-member__name">{{ member.name }}</h2>
            <p class="team-member__bio">{{ member.bio }}</p>

            <dl class="team-member__facts">
              <div class="team-member__fact">
                <dt>研究重点</dt>
                <dd>{{ member.focus }}</dd>
              </div>

              <div class="team-member__fact">
                <dt>补充说明</dt>
                <dd>{{ member.note }}</dd>
              </div>
            </dl>
          </div>
        </article>
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

const members = [
  {
    id: 'member-01',
    index: '01',
    name: '王子安',
    role: '项目负责人 / 算法设计',
    photo: '',
    bio: '负责整体技术路线设计与核心算法方案统筹，围绕多模态融合与小目标检测开展问题建模，推进关键机制设计、模块协同与整体方案落地。',
    focus: '多模态融合建模、小目标检测机制设计、整体技术路线统筹。',
    note: '在团队中承担方案总控角色，负责连接问题定义、方法设计与最终交付表达。',
  },
  {
    id: 'member-02',
    index: '02',
    name: '梁航川',
    role: '工程实现 / 实验推进',
    photo: '',
    bio: '负责模型训练、实验调试与结果复现，稳定推进主实验、消融实验与可视化验证，保障实验链路可靠闭环，并为方案优化提供可追溯依据。',
    focus: '模型训练流程、实验复现与消融验证、结果可视化分析。',
    note: '重点保障实验稳定性与结果可信度，为不同方案之间的对比评估提供支撑。',
  },
  {
    id: 'member-03',
    index: '03',
    name: '陈悦华',
    role: '网站搭建 / 方案整合',
    photo: '',
    bio: '负责项目网站搭建、技术内容整合与展示呈现，将复杂方法逻辑梳理为清晰统一的页面结构与答辩表达，提升整体呈现的完整性与说服力。',
    focus: '页面架构设计、技术内容整合、方案叙事与展示表达。',
    note: '负责将研究成果转化为对外展示材料，强化项目表达的一致性与沟通效率。',
  },
]

const memberMotion = {
  'member-01': {
    start: 'top 82%',
    mediaShift: 30,
    contentShift: 24,
    captionShift: 14,
    parallax: -2.2,
  },
  'member-02': {
    start: 'top 80%',
    mediaShift: 26,
    contentShift: 22,
    captionShift: 12,
    parallax: 2.4,
  },
  'member-03': {
    start: 'top 78%',
    mediaShift: 28,
    contentShift: 24,
    captionShift: 14,
    parallax: -1.8,
  },
}

onMounted(() => {
  if (!pageRef.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  context = gsap.context(() => {
    const hero = pageRef.value.querySelector('.team-hero')
    const heroEyebrow = hero?.querySelector('.team-hero__eyebrow')
    const heroTitle = hero?.querySelector('.team-hero__title')
    const heroIntro = hero?.querySelector('.team-hero__intro')
    const heroMain = hero?.querySelector('.team-hero__main')
    const memberNodes = members
      .map((member) => pageRef.value.querySelector(`#${member.id}`))
      .filter(Boolean)

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

    memberNodes.forEach((memberNode) => {
      const config = memberMotion[memberNode.id] ?? memberMotion['member-01']
      const rail = memberNode.querySelector('.team-member__rail')
      const railLine = memberNode.querySelector('.team-member__rail-line')
      const media = memberNode.querySelector('.team-member__media')
      const portrait = memberNode.querySelector('.team-member__portrait')
      const mediaCaption = memberNode.querySelector('.team-member__media-caption')
      const role = memberNode.querySelector('.team-member__role')
      const name = memberNode.querySelector('.team-member__name')
      const bio = memberNode.querySelector('.team-member__bio')
      const facts = memberNode.querySelector('.team-member__facts')

      gsap
        .timeline({
          defaults: {
            ease: 'power3.out',
          },
          scrollTrigger: {
            trigger: memberNode,
            start: config.start,
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
        .fromTo(rail, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.48 })
        .fromTo(
          railLine,
          { scaleY: 0, transformOrigin: 'top center' },
          { scaleY: 1, duration: 0.62 },
          0.02,
        )
        .fromTo(
          media,
          { autoAlpha: 0, y: config.mediaShift },
          { autoAlpha: 1, y: 0, duration: 0.68 },
          0.08,
        )
        .fromTo(
          mediaCaption,
          { autoAlpha: 0, y: config.captionShift },
          { autoAlpha: 1, y: 0, duration: 0.52 },
          0.18,
        )
        .fromTo(
          [role, name],
          { autoAlpha: 0, y: config.contentShift },
          { autoAlpha: 1, y: 0, duration: 0.66, stagger: 0.1 },
          0.24,
        )
        .fromTo(
          bio,
          { autoAlpha: 0, y: Math.max(config.contentShift - 4, 16) },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          0.36,
        )
        .fromTo(
          facts,
          { autoAlpha: 0, y: Math.max(config.contentShift - 6, 14) },
          { autoAlpha: 1, y: 0, duration: 0.58 },
          0.48,
        )

      if (portrait) {
        gsap.to(portrait, {
          yPercent: config.parallax,
          ease: 'none',
          scrollTrigger: {
            trigger: memberNode,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.35,
            invalidateOnRefresh: true,
          },
        })
      }
    })
  }, pageRef)
})

onBeforeUnmount(() => {
  context?.revert()
})
</script>

<style scoped>
.team-view {
  --team-space-xs: 0.75rem;
  --team-space-sm: 1rem;
  --team-space-md: 1.5rem;
  --team-space-lg: 2rem;
  --team-space-xl: clamp(3rem, 6vw, 5rem);
  min-height: calc(100vh - 56px);
  padding: 40px 24px 80px;
  font-family: var(--argus-font-body);
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  font-kerning: normal;
}

.team-page {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
}

.team-page::before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  margin-bottom: var(--team-space-xl);
  background: linear-gradient(90deg, transparent, var(--team-divider), transparent);
}

.team-hero {
  display: grid;
  gap: var(--team-space-md);
  margin-bottom: clamp(2.5rem, 7vw, 6rem);
}

.team-hero__eyebrow {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--team-eyebrow);
}

.team-hero__main {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(320px, 0.92fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: end;
}

.team-hero__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: var(--argus-type-display-xl);
  font-weight: var(--argus-weight-regular);
  line-height: var(--argus-leading-display-xl);
  letter-spacing: var(--argus-tracking-display);
  color: var(--team-title);
  text-wrap: balance;
}

.team-hero__intro {
  max-width: 42ch;
  margin: 0;
  font-size: var(--argus-type-body-lg);
  line-height: var(--argus-leading-body-lg);
  color: var(--team-copy);
  text-wrap: pretty;
}

.team-roster {
  display: grid;
}

.team-member {
  display: grid;
  grid-template-columns: 72px minmax(180px, 240px) minmax(0, 1fr);
  grid-template-areas: 'rail media content';
  gap: clamp(1.25rem, 4vw, 3rem);
  align-items: start;
  padding: clamp(2rem, 6vw, 4.5rem) 0;
  border-top: 1px solid var(--team-member-line);
}

.team-member--reverse {
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px) 72px;
  grid-template-areas: 'content media rail';
}

.team-member__rail {
  grid-area: rail;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 4px;
}

.team-member__index {
  font-size: var(--argus-type-accent-display);
  line-height: var(--argus-leading-accent-display);
  font-family: var(--argus-font-display);
  font-weight: var(--argus-weight-regular);
  letter-spacing: var(--argus-tracking-accent-display);
  color: var(--team-accent);
  font-variant-numeric: tabular-nums;
}

.team-member__rail-line {
  width: 1px;
  min-height: 132px;
  background: linear-gradient(180deg, var(--team-divider), transparent);
}

.team-member__media {
  grid-area: media;
  margin: 0;
  display: grid;
  gap: 14px;
}

.team-member__portrait {
  width: min(100%, 220px);
  aspect-ratio: 4 / 5;
  border-radius: 26px;
  object-fit: cover;
  border: 1px solid var(--team-photo-border);
  box-shadow: 0 20px 44px var(--team-photo-shadow);
  will-change: transform;
}

.team-member__portrait--placeholder {
  display: grid;
  place-content: center;
  gap: 10px;
  background:
    radial-gradient(circle at top, var(--team-photo-glow), transparent 68%),
    linear-gradient(180deg, var(--team-photo-top), var(--team-photo-bottom));
  color: var(--team-photo-text);
}

.team-member__placeholder-index {
  font-family: var(--argus-font-display);
  font-size: var(--argus-type-accent-display);
  line-height: var(--argus-leading-accent-display);
  letter-spacing: var(--argus-tracking-accent-display);
}

.team-member__placeholder-note {
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--team-photo-subtext);
}

.team-member__media-caption {
  max-width: 26ch;
  margin: 0;
  font-size: var(--argus-type-meta);
  line-height: var(--argus-leading-meta);
  color: var(--team-muted);
  text-wrap: pretty;
}

.team-member__content {
  grid-area: content;
  min-width: 0;
  display: grid;
  gap: 16px;
  align-content: start;
  will-change: transform, opacity;
}

.team-member__role {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--team-role);
}

.team-member__name {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: var(--argus-type-accent-display);
  line-height: var(--argus-leading-accent-display);
  font-weight: var(--argus-weight-regular);
  letter-spacing: var(--argus-tracking-accent-display);
  color: var(--team-name);
}

.team-member__bio {
  max-width: 62ch;
  margin: 0;
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  color: var(--team-copy);
  text-wrap: pretty;
}

.team-member__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin: 8px 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--team-fact-line);
}

.team-member__fact {
  display: grid;
  gap: 8px;
}

.team-member__fact dt {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--team-muted);
}

.team-member__fact dd {
  margin: 0;
  font-size: var(--argus-type-body-sm);
  line-height: var(--argus-leading-body-sm);
  color: var(--team-copy);
  text-wrap: pretty;
}

.theme-dark {
  --team-title: #f4efe5;
  --team-name: #f4efe5;
  --team-eyebrow: rgba(200, 168, 106, 0.78);
  --team-copy: rgba(222, 219, 210, 0.82);
  --team-role: rgba(210, 205, 194, 0.78);
  --team-muted: rgba(174, 171, 164, 0.72);
  --team-divider: rgba(200, 168, 106, 0.18);
  --team-member-line: rgba(200, 168, 106, 0.1);
  --team-fact-line: rgba(200, 168, 106, 0.08);
  --team-accent: #c8a86a;
  --team-photo-border: rgba(200, 168, 106, 0.12);
  --team-photo-shadow: rgba(5, 10, 16, 0.18);
  --team-photo-top: rgba(25, 31, 40, 0.92);
  --team-photo-bottom: rgba(11, 16, 23, 0.92);
  --team-photo-glow: rgba(200, 168, 106, 0.14);
  --team-photo-text: #f1ebdf;
  --team-photo-subtext: rgba(210, 205, 194, 0.68);
}

.theme-light {
  --team-title: #1d2430;
  --team-name: #1d2430;
  --team-eyebrow: rgba(183, 139, 67, 0.74);
  --team-copy: rgba(56, 61, 69, 0.82);
  --team-role: rgba(88, 84, 77, 0.84);
  --team-muted: rgba(98, 102, 108, 0.74);
  --team-divider: rgba(183, 139, 67, 0.18);
  --team-member-line: rgba(183, 139, 67, 0.14);
  --team-fact-line: rgba(183, 139, 67, 0.12);
  --team-accent: #b78b43;
  --team-photo-border: rgba(183, 139, 67, 0.14);
  --team-photo-shadow: rgba(94, 82, 62, 0.08);
  --team-photo-top: rgba(255, 252, 247, 0.96);
  --team-photo-bottom: rgba(244, 236, 219, 0.96);
  --team-photo-glow: rgba(183, 139, 67, 0.12);
  --team-photo-text: #1d2430;
  --team-photo-subtext: rgba(88, 84, 77, 0.72);
}

@media (max-width: 980px) {
  .team-hero__main {
    grid-template-columns: 1fr;
  }

  .team-member,
  .team-member--reverse {
    grid-template-columns: 56px minmax(180px, 220px) minmax(0, 1fr);
    grid-template-areas: 'rail media content';
  }
}

@media (max-width: 720px) {
  .team-view {
    padding: 24px 16px 48px;
  }

  .team-page::before {
    margin-bottom: 2.5rem;
  }

  .team-member,
  .team-member--reverse {
    grid-template-columns: 1fr;
    grid-template-areas:
      'rail'
      'media'
      'content';
    gap: 18px;
    padding: 30px 0;
  }

  .team-member__rail {
    flex-direction: row;
    align-items: center;
  }

  .team-member__rail-line {
    min-height: 1px;
    width: 100%;
    background: linear-gradient(90deg, var(--team-divider), transparent);
  }

  .team-member__portrait {
    width: min(100%, 200px);
  }

  .team-member__facts {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .team-member__portrait,
  .team-member__content {
    will-change: auto;
  }
}
</style>
