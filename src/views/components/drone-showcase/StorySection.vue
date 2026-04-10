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
    </div>
  </section>
</template>

<script setup>
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
  font-size: clamp(72px, 14vw, 240px);
  line-height: 0.9;
  letter-spacing: -0.08em;
  text-transform: uppercase;
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
  font-size: 0.75rem;
  font-family: var(--argus-font-body);
  font-weight: 480;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.story-copy__caption {
  margin: 0;
  max-width: 260px;
  font-size: 0.6875rem;
  line-height: 1.7;
  font-family: var(--argus-font-body);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--showcase-caption);
  text-align: right;
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
  font-weight: 480;
  font-size: clamp(40px, 5vw, 80px);
  line-height: 1;
  letter-spacing: -0.045em;
  color: var(--showcase-title);
  text-wrap: balance;
}

.story-copy__body {
  margin: 0;
  max-width: 78ch;
  font-size: 1rem;
  line-height: 1.92;
  font-family: var(--argus-font-body);
  font-weight: 500;
  color: var(--showcase-body);
  white-space: pre-line;
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
  font-weight: 600;
  font-size: clamp(24px, 2.4vw, 34px);
  letter-spacing: -0.04em;
  color: var(--showcase-title);
  font-variant-numeric: tabular-nums;
}

.story-metric__label {
  display: block;
  margin-top: 6px;
  font-size: 0.75rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--showcase-caption);
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
