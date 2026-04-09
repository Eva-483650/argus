<template>
  <section :id="sectionId" class="story-section" :class="`is-${align}`">
    <div class="story-section__inner">
      <div class="story-section__background">{{ backgroundLabel }}</div>

      <article class="story-copy">
        <p class="story-copy__eyebrow">{{ eyebrow }}</p>
        <h2 class="story-copy__title">{{ title }}</h2>
        <p class="story-copy__body">{{ description }}</p>

        <div v-if="metrics.length" class="story-copy__metrics">
          <div v-for="metric in metrics" :key="metric.label" class="story-metric">
            <span class="story-metric__value">{{ metric.value }}</span>
            <span class="story-metric__label">{{ metric.label }}</span>
          </div>
        </div>

        <p v-if="caption" class="story-copy__caption">{{ caption }}</p>
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
  max-width: 890px;
  padding: 38px 40px;
  border: 1px solid var(--showcase-card-border);
  border-radius: 28px;
  background:
    linear-gradient(180deg, var(--showcase-card-top), var(--showcase-card-bottom)),
    var(--showcase-card-base);
  box-shadow: 0 32px 90px var(--showcase-card-shadow);
  backdrop-filter: blur(24px);
}

.is-right .story-copy {
  grid-column: 5 / span 8;
}

.is-left .story-copy {
  grid-column: 1 / span 8;
}

.story-copy__eyebrow {
  margin: 0 0 18px;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--showcase-accent-soft);
}

.story-copy__title {
  margin: 0;
  font-family: 'Segoe UI Variable Display', 'SF Pro Display', 'Helvetica Neue', sans-serif;
  font-size: clamp(40px, 5vw, 80px);
  line-height: 0.96;
  letter-spacing: -0.055em;
  color: var(--showcase-title);
}

.story-copy__body {
  margin: 22px 0 0;
  font-size: 17px;
  line-height: 1.95;
  color: var(--showcase-body);
  white-space: pre-line;
}

.story-copy__metrics {
  margin-top: 28px;
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
  font-size: clamp(24px, 2.4vw, 34px);
  letter-spacing: -0.04em;
  color: var(--showcase-title);
}

.story-metric__label {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--showcase-caption);
}

.story-copy__caption {
  margin: 26px 0 0;
  font-size: 13px;
  line-height: 1.8;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--showcase-caption);
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
    padding: 24px;
  }

  .story-copy__title {
    font-size: clamp(34px, 11vw, 56px);
  }

  .story-copy__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
