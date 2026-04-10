<template>
  <main class="downloads-view" :class="`theme-${themeMode}`">
    <section class="downloads-shell">
      <header class="downloads-hero">
        <p class="downloads-hero__eyebrow">Resources</p>
        <h1 class="downloads-hero__title">Downloads</h1>
        <p class="downloads-hero__intro">
         Argus project source code.
        </p>
      </header>
            <a
              class="downloads-button downloads-button--primary"
              :href="repositoryUrl"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repository
            </a>

      </section>
  </main>
</template>

<script setup>
import { computed, inject, ref } from 'vue'

const injectedTheme = inject('argusTheme', ref(true))
const themeMode = computed(() => (injectedTheme.value ? 'dark' : 'light'))

const repositoryUrl = 'https://github.com/Eva-483650/argus'
</script>

<style scoped>
.downloads-view {
  min-height: calc(100vh - 56px);
  padding: 40px 24px 72px;
  font-family: var(--argus-font-body);
  font-kerning: normal;
}

.downloads-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 34px 44px;
  border-radius: 28px;
  border: 1px solid var(--downloads-shell-border);
  background:
    linear-gradient(180deg, var(--downloads-shell-top), var(--downloads-shell-bottom)),
    var(--downloads-shell-bg);
  box-shadow: 0 24px 72px var(--downloads-shell-shadow);
  backdrop-filter: blur(18px);
}

.downloads-hero {
  max-width: 760px;
  margin-bottom: 30px;
}

.downloads-hero__eyebrow {
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--downloads-eyebrow);
}

.downloads-hero__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--downloads-title);
  text-wrap: balance;
}

.downloads-hero__intro {
  margin: 16px 0 0;
  font-size: 1rem;
  font-family: var(--argus-font-body);
  font-weight: 500;
  line-height: 1.9;
  color: var(--downloads-copy);
}

.downloads-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.9fr);
  gap: 22px;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid var(--downloads-card-border);
  background: var(--downloads-card-bg);
}

.downloads-card__badge {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--downloads-badge-bg);
  color: var(--downloads-badge-text);
  font-size: 0.75rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.downloads-card__title {
  margin: 0;
  font-family: var(--argus-font-display);
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  line-height: 1.02;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--downloads-heading);
}

.downloads-card__body {
  margin: 16px 0 0;
  font-size: 1rem;
  font-family: var(--argus-font-body);
  font-weight: 500;
  line-height: 1.88;
  color: var(--downloads-copy);
}

.downloads-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.downloads-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 0.9375rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: -0.01em;
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

.downloads-button--primary {
  background: var(--downloads-button-bg);
  color: var(--downloads-button-text);
  box-shadow: 0 14px 30px var(--downloads-button-shadow);
}

.downloads-button--ghost {
  border-color: var(--downloads-ghost-border);
  background: var(--downloads-ghost-bg);
  color: var(--downloads-ghost-text);
}

.downloads-meta {
  display: grid;
  gap: 14px;
}

.downloads-meta__block {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid var(--downloads-meta-border);
  background: var(--downloads-meta-bg);
}

.downloads-meta__label {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 0.6875rem;
  font-family: var(--argus-font-body);
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--downloads-meta-label);
}

.downloads-meta__value {
  display: block;
  font-size: 0.8125rem;
  font-family: var(--argus-font-body);
  font-weight: 600;
  line-height: 1.7;
  color: var(--downloads-heading);
  word-break: break-all;
}

.downloads-meta__text {
  margin: 0;
  font-size: 0.875rem;
  font-family: var(--argus-font-body);
  font-weight: 500;
  line-height: 1.78;
  color: var(--downloads-copy);
}

.theme-dark {
  --downloads-shell-bg: rgba(10, 14, 20, 0.28);
  --downloads-shell-top: rgba(255, 255, 255, 0.06);
  --downloads-shell-bottom: rgba(255, 255, 255, 0.015);
  --downloads-shell-border: rgba(200, 168, 106, 0.12);
  --downloads-shell-shadow: rgba(5, 10, 16, 0.16);
  --downloads-eyebrow: rgba(200, 168, 106, 0.82);
  --downloads-title: #f4efe5;
  --downloads-heading: #f4efe5;
  --downloads-copy: rgba(222, 219, 210, 0.82);
  --downloads-card-border: rgba(200, 168, 106, 0.1);
  --downloads-card-bg: rgba(255, 255, 255, 0.02);
  --downloads-badge-bg: rgba(200, 168, 106, 0.1);
  --downloads-badge-text: #c8a86a;
  --downloads-button-bg: linear-gradient(135deg, #c8a86a, #b78b43);
  --downloads-button-text: #101724;
  --downloads-button-shadow: rgba(200, 168, 106, 0.18);
  --downloads-ghost-border: rgba(200, 168, 106, 0.12);
  --downloads-ghost-bg: rgba(255, 255, 255, 0.02);
  --downloads-ghost-text: #f1ebdf;
  --downloads-meta-border: rgba(200, 168, 106, 0.1);
  --downloads-meta-bg: rgba(255, 255, 255, 0.02);
  --downloads-meta-label: rgba(174, 171, 164, 0.72);
}

.theme-light {
  --downloads-shell-bg: rgba(255, 251, 244, 0.48);
  --downloads-shell-top: rgba(255, 255, 255, 0.68);
  --downloads-shell-bottom: rgba(245, 241, 234, 0.48);
  --downloads-shell-border: rgba(183, 139, 67, 0.14);
  --downloads-shell-shadow: rgba(94, 82, 62, 0.06);
  --downloads-eyebrow: rgba(183, 139, 67, 0.74);
  --downloads-title: #1d2430;
  --downloads-heading: #1d2430;
  --downloads-copy: rgba(56, 61, 69, 0.82);
  --downloads-card-border: rgba(183, 139, 67, 0.14);
  --downloads-card-bg: rgba(255, 255, 255, 0.56);
  --downloads-badge-bg: rgba(183, 139, 67, 0.1);
  --downloads-badge-text: #b78b43;
  --downloads-button-bg: linear-gradient(135deg, #c59b4f, #b78b43);
  --downloads-button-text: #1d2430;
  --downloads-button-shadow: rgba(183, 139, 67, 0.16);
  --downloads-ghost-border: rgba(183, 139, 67, 0.14);
  --downloads-ghost-bg: rgba(255, 255, 255, 0.5);
  --downloads-ghost-text: #1d2430;
  --downloads-meta-border: rgba(183, 139, 67, 0.14);
  --downloads-meta-bg: rgba(255, 255, 255, 0.48);
  --downloads-meta-label: rgba(98, 102, 108, 0.74);
}

@media (max-width: 860px) {
  .downloads-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .downloads-view {
    padding: 22px 16px 40px;
  }

  .downloads-shell {
    padding: 28px 20px 30px;
    border-radius: 22px;
  }

  .downloads-card {
    padding: 20px;
  }

  .downloads-card__title {
    font-size: 24px;
  }
}
</style>
