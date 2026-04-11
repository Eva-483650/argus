<template>
  <section :id="sectionId" class="story-section" :class="[`is-${align}`, `variant-${variant}`]">
    <div class="story-section__inner">
      <div class="story-section__background">{{ backgroundLabel }}</div>

      <article class="story-copy">
        <header class="story-copy__header">
          <p class="story-copy__eyebrow">{{ eyebrow }}</p>
          <p v-if="caption" class="story-copy__caption">{{ caption }}</p>
        </header>

        <div class="story-copy__main">
          <div class="story-copy__lead">
            <h2 class="story-copy__title">{{ title }}</h2>
            <p class="story-copy__body">{{ description }}</p>
          </div>

          <div v-if="metrics.length" class="story-copy__metrics">
            <div v-for="metric in metrics" :key="metric.label" class="story-metric">
              <span class="story-metric__value">{{ metric.value }}</span>
              <span class="story-metric__label">{{ metric.label }}</span>
            </div>
          </div>
        </div>
      </article>

      <div v-if="hasMedia" class="story-section__media">
        <slot name="media"></slot>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()
const hasMedia = computed(() => Boolean(slots.media))

defineProps({
  sectionId: {
    type: String,
    default: '',
  },
  backgroundLabel: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  metrics: {
    type: Array,
    default: () => [],
  },
  align: {
    type: String,
    default: 'right',
  },
  variant: {
    type: String,
    default: 'hero',
  },
})
</script>

<style scoped>
.story-section {
  position: relative;
  min-height: 132vh;
  display: flex;
  align-items: center;
}

.story-section__inner {
  position: relative;
  width: min(1440px, calc(100% - 72px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;
  padding: 18vh 0 18vh;
}

.story-section__background {
  position: absolute;
  inset: 50% auto auto 0;
  transform: translateY(-50%);
  font-family: var(--argus-font-display);
  font-size: clamp(72px, 14vw, 240px);
  line-height: 0.9;
  font-weight: var(--argus-weight-regular);
  letter-spacing: var(--argus-tracking-display);
  color: var(--showcase-ghost);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

.story-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 26px;
}

.story-section__media {
  position: relative;
  z-index: 1;
}

#section-launch .story-copy {
  transform: translateY(-8vh);
}

.is-right .story-copy {
  grid-column: 6 / span 8;
}

.is-left .story-copy {
  grid-column: 1 / span 8;
}

.story-copy__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.story-copy__eyebrow {
  margin: 0;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.story-copy__caption {
  margin: 0;
  max-width: 260px;
  font-size: var(--argus-type-meta);
  line-height: var(--argus-leading-meta);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-regular);
  letter-spacing: 0;
  color: var(--showcase-caption);
  text-align: right;
  text-wrap: pretty;
}

.story-copy__main {
  display: grid;
  gap: 28px;
}

.story-copy__lead {
  display: grid;
  gap: 22px;
}

.story-copy__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-weight: var(--argus-weight-regular);
  font-size: var(--argus-type-display-xl);
  line-height: var(--argus-leading-display-xl);
  letter-spacing: var(--argus-tracking-display);
  color: var(--showcase-title);
  text-wrap: balance;
}

.story-copy__body {
  margin: 0;
  max-width: 65ch;
  font-size: var(--argus-type-body-md);
  line-height: var(--argus-leading-body-md);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-regular);
  color: var(--showcase-body);
  white-space: pre-line;
  text-wrap: pretty;
}

.story-copy__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.story-metric {
  padding-top: 14px;
  border-top: 1px solid var(--showcase-metric-border);
}

.story-metric__value {
  display: block;
  font-family: var(--argus-font-display);
  font-weight: var(--argus-weight-regular);
  font-size: var(--argus-type-accent-display);
  line-height: var(--argus-leading-accent-display);
  letter-spacing: var(--argus-tracking-accent-display);
  color: var(--showcase-title);
  font-variant-numeric: tabular-nums;
}

.story-metric__label {
  display: block;
  margin-top: 6px;
  font-size: var(--argus-type-label);
  line-height: var(--argus-leading-label);
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-medium);
  letter-spacing: var(--argus-tracking-label);
  text-transform: uppercase;
  color: var(--showcase-caption);
  text-wrap: pretty;
}

.variant-hero .story-copy {
  max-width: 860px;
}

.variant-hero .story-copy__header {
  max-width: 640px;
}

.variant-hero .story-copy__caption {
  margin-top: 2px;
}

.variant-hero .story-copy__main {
  grid-template-columns: minmax(0, 1fr);
}

.variant-hero .story-copy__metrics {
  width: min(520px, 100%);
}

.variant-hero .story-copy__title {
  font-size: var(--argus-type-hero-title);
  line-height: var(--argus-leading-hero-title);
}

.variant-hero .story-copy__body {
  font-size: var(--argus-type-body-lg);
  line-height: var(--argus-leading-body-lg);
}

.variant-method .story-copy {
  grid-column: 1 / span 10;
}

.variant-method .story-copy__header {
  max-width: 320px;
}

.variant-method .story-copy__main {
  grid-template-columns: minmax(0, 1.3fr) minmax(240px, 0.62fr);
  gap: 34px;
  align-items: start;
}

.variant-method .story-copy__lead {
  padding-right: 30px;
  border-right: 1px solid var(--showcase-metric-border);
}

.variant-method .story-copy__metrics {
  align-self: start;
  grid-template-columns: 1fr;
  padding-top: 8px;
}

.variant-outcome .story-copy {
  max-width: 720px;
}

.variant-outcome .story-copy__header {
  flex-direction: column;
  gap: 10px;
}

.variant-outcome .story-copy__caption {
  text-align: left;
  max-width: 360px;
}

.variant-outcome .story-copy__main {
  gap: 34px;
}

.variant-outcome .story-copy__metrics {
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 20px;
}

.variant-outcome .story-metric {
  padding-top: 18px;
}

.variant-demo .story-copy {
  grid-column: 1 / span 4;
  max-width: 420px;
  align-self: center;
}

.variant-demo .story-copy__header {
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
}

.variant-demo .story-copy__caption {
  text-align: left;
  max-width: 360px;
}

.variant-demo .story-copy__main {
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

.variant-demo .story-copy__body {
  max-width: 34ch;
  font-size: var(--argus-type-body-lg);
  line-height: var(--argus-leading-body-lg);
}

.variant-demo .story-copy__title {
  /* font-size: var(--argus-type-accent-display); */
  font-size: var(--argus-type-display-xl);
  line-height: var(--argus-leading-accent-display);
  letter-spacing: var(--argus-tracking-accent-display);
}

.variant-demo .story-section__media {
  grid-column: 6 / span 7;
  align-self: center;
}

@media (max-width: 960px) {
  .story-section {
    min-height: 118vh;
  }

  .story-section__inner {
    width: min(100%, calc(100% - 32px));
    grid-template-columns: 1fr;
    padding: 20vh 0 14vh;
  }

  .story-section__background {
    top: 20%;
    left: 0;
    transform: none;
    font-size: clamp(56px, 18vw, 120px);
  }

  .story-copy,
  .is-right .story-copy,
  .is-left .story-copy {
    grid-column: 1;
    max-width: none;
  }

  .story-section__media,
  .variant-demo .story-section__media {
    grid-column: 1;
  }

  #section-launch .story-copy {
    transform: translateY(-4vh);
  }

  .story-copy__header {
    flex-direction: column;
    gap: 10px;
  }

  .story-copy__caption {
    text-align: left;
    max-width: none;
  }

  .story-copy__title {
    font-size: clamp(34px, 11vw, 56px);
  }

  .variant-hero .story-copy__title {
    font-size: clamp(3rem, 11vw, 4.5rem);
  }

  .variant-method .story-copy__title,
  .variant-outcome .story-copy__title {
    font-size: clamp(2.5rem, 9vw, 3.5rem);
  }

  .variant-demo .story-copy__title {
    font-size: clamp(2.125rem, 8vw, 3rem);
  }

  .story-copy__metrics {
    grid-template-columns: 1fr;
  }

  .variant-method .story-copy__main {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .variant-method .story-copy__lead {
    padding-right: 0;
    border-right: none;
  }

  .variant-outcome .story-copy__metrics {
    grid-template-columns: 1fr;
    gap: 14px;
  }

}
</style>
