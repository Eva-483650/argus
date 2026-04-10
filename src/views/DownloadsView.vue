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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--downloads-eyebrow);
}

.downloads-hero__title {
  margin: 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1.04;
  color: var(--downloads-title);
}

.downloads-hero__intro {
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.85;
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.downloads-card__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.12;
  font-weight: 700;
  color: var(--downloads-heading);
}

.downloads-card__body {
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.85;
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
  font-size: 14px;
  font-weight: 700;
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
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--downloads-meta-label);
}

.downloads-meta__value {
  display: block;
  font-size: 13px;
  line-height: 1.7;
  color: var(--downloads-heading);
  word-break: break-all;
}

.downloads-meta__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--downloads-copy);
}

.theme-dark {
  --downloads-shell-bg: rgba(8, 15, 26, 0.5);
  --downloads-shell-top: rgba(255, 255, 255, 0.03);
  --downloads-shell-bottom: rgba(255, 255, 255, 0.01);
  --downloads-shell-border: rgba(255, 255, 255, 0.08);
  --downloads-shell-shadow: rgba(0, 0, 0, 0.24);
  --downloads-eyebrow: rgba(212, 176, 106, 0.82);
  --downloads-title: #f8f3e7;
  --downloads-heading: #f3eee4;
  --downloads-copy: rgba(221, 229, 238, 0.82);
  --downloads-card-border: rgba(255, 255, 255, 0.08);
  --downloads-card-bg: rgba(255, 255, 255, 0.03);
  --downloads-badge-bg: rgba(212, 176, 106, 0.1);
  --downloads-badge-text: #d4b06a;
  --downloads-button-bg: linear-gradient(135deg, #d4b06a, #b68a43);
  --downloads-button-text: #101724;
  --downloads-button-shadow: rgba(212, 176, 106, 0.22);
  --downloads-ghost-border: rgba(255, 255, 255, 0.12);
  --downloads-ghost-bg: rgba(255, 255, 255, 0.02);
  --downloads-ghost-text: #e6edf5;
  --downloads-meta-border: rgba(255, 255, 255, 0.08);
  --downloads-meta-bg: rgba(255, 255, 255, 0.02);
  --downloads-meta-label: rgba(168, 182, 198, 0.82);
}

.theme-light {
  --downloads-shell-bg: rgba(255, 255, 255, 0.72);
  --downloads-shell-top: rgba(255, 255, 255, 0.72);
  --downloads-shell-bottom: rgba(248, 250, 252, 0.52);
  --downloads-shell-border: rgba(148, 163, 184, 0.18);
  --downloads-shell-shadow: rgba(15, 23, 42, 0.08);
  --downloads-eyebrow: rgba(78, 110, 189, 0.82);
  --downloads-title: #4f78d4;
  --downloads-heading: #1f2f49;
  --downloads-copy: rgba(60, 73, 92, 0.9);
  --downloads-card-border: rgba(148, 163, 184, 0.16);
  --downloads-card-bg: rgba(255, 255, 255, 0.56);
  --downloads-badge-bg: rgba(79, 120, 212, 0.1);
  --downloads-badge-text: #4f78d4;
  --downloads-button-bg: linear-gradient(135deg, #4f78d4, #7a9eff);
  --downloads-button-text: #f8fbff;
  --downloads-button-shadow: rgba(79, 120, 212, 0.18);
  --downloads-ghost-border: rgba(148, 163, 184, 0.22);
  --downloads-ghost-bg: rgba(255, 255, 255, 0.5);
  --downloads-ghost-text: #29416c;
  --downloads-meta-border: rgba(148, 163, 184, 0.16);
  --downloads-meta-bg: rgba(255, 255, 255, 0.48);
  --downloads-meta-label: rgba(101, 119, 146, 0.82);
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
