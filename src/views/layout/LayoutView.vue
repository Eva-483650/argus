<template>
  <div class="layout-container" :class="themeClass" @pointermove="handleHeaderReveal">
    <NetworkBackground :mode="bgMode" />
    <div class="page-overlay"></div>

    <el-container class="page-shell" :class="{ 'page-shell--immersive': isResearchRoute }">
      <el-header
        class="top-header"
        :class="{
          'top-header--immersive': isResearchRoute,
          'top-header--expanded': isHeaderRevealActive,
        }"
      >
        <div class="brand-section">
          <div class="brand-text">
            <h1>Argus</h1>
            <p>全天候交通场景多模态小目标检测</p>
          </div>
        </div>

        <div class="header-actions">
          <el-menu class="top-menu" mode="horizontal" :default-active="$route.path":ellipsis="false" router>
            <el-menu-item index="/research">研究展示</el-menu-item>
            <el-menu-item index="/project">可视化</el-menu-item>
            <el-menu-item index="/upload">模型演示</el-menu-item>
            <el-menu-item index="/team">团队成员</el-menu-item>
            <el-menu-item index="/downloads">资料下载</el-menu-item>
          </el-menu>

          <button class="theme-toggle" @click="toggleTheme">
            <span class="toggle-dot"></span>
            <span>{{ isDark ? '深色' : '浅色' }}</span>
          </button>
        </div>
      </el-header>

      <el-main class="main-content" :class="{ 'main-content--immersive': isResearchRoute }">
        <div class="content-panel">
          <router-view />
        </div>
      </el-main>

      <el-footer v-if="!isResearchRoute" class="footer">
        (c) 2026 Argus
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, readonly, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import NetworkBackground from '@/views/components/NetworkBackground.vue'

const route = useRoute()
const isDark = ref(true)
const isHeaderRevealActive = ref(false)

const bgMode = computed(() => (isDark.value ? 'dark' : 'light'))
const themeClass = computed(() => (isDark.value ? 'theme-dark' : 'theme-light'))
const isResearchRoute = computed(() => route.path === '/research')

provide('argusTheme', readonly(isDark))

function toggleTheme() {
  isDark.value = !isDark.value
}

function handleHeaderReveal(event) {
  const supportsHoverHeader = window.matchMedia(
    '(min-width: 961px) and (hover: hover) and (pointer: fine)',
  ).matches

  if (supportsHoverHeader) {
    isHeaderRevealActive.value = event.clientY <= 80
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('argus-theme')
  if (savedTheme === 'light') {
    isDark.value = false
  } else if (savedTheme === 'dark') {
    isDark.value = true
  }
})

watch(isDark, (val) => {
  localStorage.setItem('argus-theme', val ? 'dark' : 'light')
})
</script>

<style lang="scss" scoped>

.layout-container {
  --argus-font-display: 'Instrument Serif', Georgia, serif;
  --argus-font-body: 'DM Sans', system-ui, sans-serif;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--page-bg);
  color: var(--text-color);
  font-family: var(--argus-font-body);
  font-size: var(--argus-type-body-base);
  line-height: var(--argus-leading-body-base);
  font-kerning: normal;
}

.page-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      circle at center,
      var(--overlay-center) 0%,
      var(--overlay-mid) 40%,
      var(--overlay-edge) 100%
    ),
    linear-gradient(var(--overlay-top), var(--overlay-bottom));
}

.page-shell {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  background: transparent;
}

.page-shell--immersive {
  min-height: 100vh;
}

.top-header {
  position: sticky;
  top: 0;
  z-index: 4;
  height: 80px;
  padding: 0 32px;
  background: var(--nav-bg);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--nav-border);
  box-shadow: 0 8px 28px var(--nav-shadow);

  .brand-section {
    display: flex;
    align-items: center;
    min-width: 280px;

    .brand-text {
      display: flex;
      flex-direction: column;
      justify-content: center;

      h1 {
        margin: 0;
        font-size: 2rem;
        line-height: 1;
        font-weight: var(--argus-weight-regular);
        letter-spacing: -0.02em;
        color: var(--brand-title);
        font-family: var(--argus-font-display);
      }

      p {
        margin: 3px 0 0;
        font-size: var(--argus-type-label);
        line-height: var(--argus-leading-label);
        color: var(--brand-subtitle);
        letter-spacing: var(--argus-tracking-label);
        text-transform: uppercase;
        font-family: var(--argus-font-body);
        font-weight: var(--argus-weight-medium);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 100%;
    min-width: 0;
    flex: 1;
    justify-content: flex-end;
  }
}

.top-header--immersive {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
}

@media (min-width: 961px) and (hover: hover) and (pointer: fine) {
  .top-header {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 5;
    will-change: transform;
    transform: translateY(calc(-100% + 10px));
    transition: transform 240ms cubic-bezier(0.25, 1, 0.5, 1);

    &:focus-within,
    &.top-header--expanded {
      transform: translateY(0);
    }
  }

  .main-content {
    padding-top: 108px;
  }

  .main-content--immersive {
    padding-top: 82px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .top-header {
    transition-duration: 0.01ms;
  }
}

.top-menu {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  border-bottom: none !important;
  background: transparent;

  :deep(.el-menu),
  :deep(.el-menu--horizontal) {
    height: 100%;
    align-items: stretch;
    border-bottom: none !important;
    background: transparent !important;
  }

  :deep(.el-menu-item) {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 100%;
    line-height: normal;
    border-bottom: none !important;
    color: var(--nav-text) !important;
    font-size: var(--argus-type-nav);
    font-weight: var(--argus-weight-medium);
    letter-spacing: 0.02em;
    padding: 0 22px;
    background: transparent !important;
    transition:
      color 0.3s ease,
      background 0.3s ease,
      transform 0.25s ease;
    font-family: var(--argus-font-body);
  }

  :deep(.el-menu-item::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 14px;
    width: 60%;
    height: 2.5px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, var(--nav-active), transparent);
    transform: translateX(-50%) scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
    box-shadow: 0 0 8px var(--nav-active-shadow);
  }

  :deep(.el-menu-item:hover) {
    background: var(--nav-hover-bg) !important;
    color: var(--nav-hover-text) !important;
    transform: translateY(-1px);
  }

  :deep(.el-menu-item:hover::after) {
    transform: translateX(-50%) scaleX(0.75);
  }

  :deep(.el-menu-item:focus-visible) {
    outline: 2px solid var(--nav-active);
    outline-offset: -2px;
  }

  :deep(.el-menu-item.is-active) {
    color: var(--nav-active) !important;
    background: var(--nav-active-bg) !important;
    font-weight: var(--argus-weight-medium);
    box-shadow: inset 0 -1px 0 var(--nav-active-line);
  }

  :deep(.el-menu-item.is-active::after) {
    transform: translateX(-50%) scaleX(1);
  }
}

.theme-toggle {
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--toggle-border);
  background: var(--toggle-bg);
  color: var(--toggle-text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
  font-size: var(--argus-type-nav);
  line-height: var(--argus-leading-nav);
  font-weight: var(--argus-weight-medium);
  letter-spacing: 0.02em;
  font-family: var(--argus-font-body);

  &:hover {
    transform: translateY(-1px);
    background: var(--toggle-hover-bg);
    border-color: var(--toggle-hover-border);
  }

  &:focus-visible {
    outline: 2px solid var(--nav-active);
    outline-offset: 2px;
  }

  .toggle-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--nav-active);
    box-shadow: 0 0 10px var(--nav-active-shadow);
    flex-shrink: 0;
  }
}

.main-content {
  flex: 1;
  padding: 28px 32px 20px;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.main-content--immersive {
  padding: 82px 0 0;
}

.content-panel {
  width: 100%;
}

.footer {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--footer-text);
  font-size: var(--argus-type-meta);
  line-height: var(--argus-leading-meta);
  letter-spacing: 0.06em;
  background: transparent;
  font-family: var(--argus-font-body);
  font-weight: var(--argus-weight-regular);
}

.theme-dark {
  --page-bg: #020817;
  --overlay-center: rgba(255, 255, 255, 0.02);
  --overlay-mid: rgba(255, 255, 255, 0.008);
  --overlay-edge: rgba(0, 0, 0, 0.14);
  --overlay-top: rgba(2, 8, 23, 0.24);
  --overlay-bottom: rgba(2, 8, 23, 0.4);
  --nav-bg: rgba(9, 18, 30, 0.66);
  --nav-border: rgba(255, 255, 255, 0.08);
  --nav-shadow: rgba(0, 0, 0, 0.22);
  --brand-title: #f7f4ed;
  --brand-subtitle: #aeb9c7;
  --nav-text: #d8dee6;
  --nav-hover-text: #ffffff;
  --nav-active: #d4b06a;
  --nav-hover-bg: rgba(255, 255, 255, 0.06);
  --nav-active-bg: rgba(212, 176, 106, 0.08);
  --nav-active-line: rgba(212, 176, 106, 0.18);
  --nav-active-shadow: rgba(212, 176, 106, 0.35);
  --toggle-bg: rgba(255, 255, 255, 0.06);
  --toggle-text: #e2e8f0;
  --toggle-border: rgba(255, 255, 255, 0.12);
  --toggle-hover-bg: rgba(255, 255, 255, 0.1);
  --toggle-hover-border: rgba(212, 176, 106, 0.35);
  --footer-text: #b9c3cf;
  --text-color: #e5e7eb;
}

.theme-light {
  --page-bg: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  --overlay-center: rgba(255, 255, 255, 0.3);
  --overlay-mid: rgba(255, 255, 255, 0.16);
  --overlay-edge: rgba(226, 232, 240, 0.2);
  --overlay-top: rgba(248, 250, 252, 0.18);
  --overlay-bottom: rgba(241, 245, 249, 0.34);
  --nav-bg: rgba(255, 255, 255, 0.72);
  --nav-border: rgba(148, 163, 184, 0.16);
  --nav-shadow: rgba(15, 23, 42, 0.08);
  --brand-title: #0f172a;
  --brand-subtitle: #64748b;
  --nav-text: #334155;
  --nav-hover-text: #1e293b;
  --nav-active: #c59b4f;
  --nav-hover-bg: rgba(197, 155, 79, 0.08);
  --nav-active-bg: rgba(197, 155, 79, 0.08);
  --nav-active-line: rgba(197, 155, 79, 0.14);
  --nav-active-shadow: rgba(197, 155, 79, 0.22);
  --toggle-bg: rgba(255, 255, 255, 0.58);
  --toggle-text: #334155;
  --toggle-border: rgba(148, 163, 184, 0.22);
  --toggle-hover-bg: rgba(255, 255, 255, 0.8);
  --toggle-hover-border: rgba(197, 155, 79, 0.32);
  --footer-text: #64748b;
  --text-color: #1e293b;
}

@media (max-width: 1100px) {
  .top-header {
    padding: 0 20px;

    .header-actions {
      gap: 10px;
    }
  }

  .top-menu {
    :deep(.el-menu-item) {
      padding: 0 14px;
      font-size: 14px;
    }
  }
}

@media (max-width: 960px) {
  .top-header {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    height: auto;
    padding: 16px 20px 12px;

    .brand-section {
      margin-bottom: 10px;
      min-width: auto;
    }

    .header-actions {
      width: 100%;
      height: auto;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
  }

  .top-menu {
    width: 100%;
    height: auto;
    overflow-x: auto;
    flex: none;

    :deep(.el-menu),
    :deep(.el-menu--horizontal) {
      height: auto;
    }

    :deep(.el-menu-item) {
      display: inline-flex;
      align-items: center;
      height: 48px;
      line-height: 48px;
      padding: 0 14px;
      font-size: 14px;
    }

    :deep(.el-menu-item::after) {
      bottom: 6px;
    }
  }

  .theme-toggle {
    align-self: flex-end;
  }

  .main-content {
    padding: 18px;
  }

  .main-content--immersive {
    padding: 140px 0 0;
  }
}
</style>
