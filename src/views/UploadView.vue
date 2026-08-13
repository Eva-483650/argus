<template>
  <main class="upload-view" :class="{ 'is-light': !isDark }">
    <header class="upload-intro">
      <div>
        <p class="upload-kicker">ARGUS / MODEL LAB</p>
        <h1>航拍交通解析</h1>
      </div>
      <p class="upload-intro__copy">
        导入无人机俯视影像，演示模型对道路中全部车辆的定位、分类与轨迹关联能力。
      </p>
    </header>

    <section class="workflow" aria-label="航拍交通推理演示">
      <aside class="input-panel">
        <div class="panel-heading">
          <span class="step-number">01</span>
          <div>
            <p>输入素材</p>
            <h2>导入航拍影像</h2>
          </div>
        </div>

        <input
          ref="fileInput"
          class="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          @change="handleFileChange"
        />

        <button
          class="drop-zone"
          :class="{ 'is-dragging': isDragging, 'has-file': selectedFile }"
          type="button"
          @click="openFilePicker"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <template v-if="!selectedFile">
            <span class="drop-zone__symbol" aria-hidden="true">
              <img :src="uploadIcon" alt="" />
            </span>
            <strong>拖放航拍素材至此</strong>
            <span>或从本地选择文件</span>
            <small>JPG、PNG、MP4、MOV，建议不超过 500 MB</small>
          </template>
          <template v-else>
            <div class="upload-preview" :class="{ 'is-uploading': isUploading }" aria-hidden="true">
              <video
                v-if="selectedFile.kind === 'video'"
                :src="selectedFile.previewUrl"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
                aria-label="已上传的视频预览"
                @error="handlePreviewError"
              ></video>
              <img v-else :src="selectedFile.previewUrl" alt="已上传的航拍图片预览" @error="handlePreviewError" />
              <span class="upload-preview__type">{{ selectedFile.kind === 'video' ? 'VIDEO' : 'IMAGE' }}</span>
              <span v-if="isUploading" class="upload-preview__scan"></span>
            </div>
            <span class="drop-zone__eyebrow">{{ isUploading ? '正在传输' : '素材就绪' }}</span>
            <strong>{{ selectedFile.name }}</strong>
            <span>{{ selectedFile.kind === 'video' ? '视频序列' : '静态影像' }} · {{ selectedFile.size }}</span>
            <small>{{ isUploading ? `正在校验文件完整性 ${uploadProgress}%` : '点击可替换素材' }}</small>
          </template>
        </button>

        <div v-if="selectedFile" class="file-line">
          <span class="file-line__type">{{ selectedFile.kind === 'video' ? 'VID' : 'IMG' }}</span>
          <span class="file-line__name">{{ selectedFile.name }}</span>
          <span v-if="isUploading" class="file-line__progress">{{ uploadProgress }}%</span>
          <button type="button" aria-label="移除已上传素材" title="移除素材" @click="clearFile">
            <Close />
          </button>
          <div v-if="isUploading" class="file-line__track" aria-hidden="true">
            <i :style="{ transform: `scaleX(${uploadProgress / 100})` }"></i>
          </div>
        </div>

        <button class="infer-button" type="button" :disabled="isAnalyzing || isUploading" @click="startInference">
          <span v-if="isAnalyzing" class="button-spinner" aria-hidden="true"></span>
          <Cpu v-else aria-hidden="true" />
          {{ isUploading ? '正在准备素材' : isAnalyzing ? '模型正在解析道路目标' : '开始推理分析' }}
          <ArrowRight v-if="!isAnalyzing && !isUploading" aria-hidden="true" />
        </button>
        <div v-if="isFileReady" class="input-ready" aria-live="polite">
          <span class="input-ready__check"><Check /></span>
          <span>影像已就绪</span>
        </div>
      </aside>

      <section class="result-stage" :class="{ 'has-result': resultReady }">
        <div class="stage-header">
          <div class="panel-heading">
            <span class="step-number">02</span>
            <div>
              <p>分析输出</p>
              <h2>车辆全量标注结果</h2>
            </div>
          </div>
          <div v-if="resultReady" class="result-actions">
            <button type="button" title="重新开始" @click="resetDemo"><RefreshRight /></button>
            <a :href="outputAsset" :download="outputFilename" title="下载标注结果"><Download /></a>
          </div>
        </div>

        <div class="preview-shell">
          <template v-if="isAnalyzing">
            <div class="analysis-state">
              <div class="analysis-state__radar"><span></span><i></i></div>
              <p>ARGUS INFERENCE ENGINE</p>
              <strong>{{ analysisPhase.title }}</strong>
              <span>{{ analysisPhase.detail }}</span>
              <div class="analysis-steps" aria-label="推理阶段">
                <span v-for="(step, index) in analysisSteps" :key="step" :class="{ 'is-active': analysisPhase.index === index, 'is-complete': analysisPhase.index > index }">
                  <i></i>{{ step }}
                </span>
              </div>
              <div class="analysis-progress"><i :style="{ transform: `scaleX(${analysisProgress / 100})` }"></i></div>
              <small>{{ analysisProgress }}%</small>
            </div>
          </template>

          <template v-else-if="resultReady">
            <div class="media-frame" :key="resultRun">
              <video
                v-if="resultKind === 'video'"
                class="result-media"
                :src="outputAsset"
                autoplay
                muted
                loop
                controls
                playsinline
              ></video>
              <img v-else class="result-media" :src="outputAsset" alt="道路车辆标注推理结果" />
              <div class="media-badges">
                <span class="live-badge"><i></i> DETECTED</span>
                <span>{{ resultKind === 'video' ? 'TRACKING ON' : 'IMAGE RESULT' }}</span>
              </div>
              <div class="annotation-burst" aria-hidden="true">
                <i v-for="particle in 8" :key="particle" :style="{ '--burst-index': particle }"></i>
              </div>
              <!-- <div class="result-confirmation" aria-live="polite">
                <span class="result-confirmation__check"><Check /></span>
                <strong>标注图层已生成</strong>
              </div> -->
            </div>
          </template>

          <template v-else>
            <div class="empty-stage">
              <div class="empty-stage__mark"><img :src="scanIcon" alt="" /></div>
              <p>等待输入</p>
              <strong>标注结果将在这里呈现</strong>
              <span>上传影像并启动推理后，可查看带有车辆边界框、类别与轨迹 ID 的输出画面。</span>
            </div>
          </template>
        </div>

        <div class="stage-footer" :class="{ 'is-result': resultReady }">
          <template v-if="resultReady">
            <div class="metric">
              <span>标注图层</span>
              <strong>已生成</strong>
            </div>
            <div class="metric">
              <span>输出类型</span>
              <strong>{{ resultKind === 'video' ? 'MP4' : 'JPG' }}</strong>
            </div>
            <p>车辆框、类别已渲染至输出图层</p>
          </template>
          <template v-else>
            <span>OUTPUT / DETECTION + CLASSIFICATION + TRACKING</span>
            <span>READY FOR DEMONSTRATION</span>
          </template>
        </div>
        
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import {
  ArrowRight,
  Check,
  Close,
  Cpu,
  Download,
  RefreshRight,
} from '@element-plus/icons-vue'
import sampleImageResult from '@/assets/imgs/9/rgb_prediction.jpg'
import sampleVideoResult from '@/assets/imgs/10/rgb_prediction_web.mp4'
import uploadIcon from '@/assets/icons/upload.png'
import scanIcon from '@/assets/icons/scan.png'

const isDark = inject('argusTheme', ref(true))
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const isAnalyzing = ref(false)
const resultReady = ref(false)
const resultKind = ref('image')
const resultRun = ref(0)
const isUploading = ref(false)
const uploadProgress = ref(0)
const analysisProgress = ref(0)

let analysisTimer
let uploadTimer
let selectedFileUrl = ''

const analysisSteps = ['影像预处理', '车辆检测', '目标关联', '标注渲染']
const isFileReady = computed(() => Boolean(selectedFile.value) && !isUploading.value)
const analysisPhase = computed(() => {
  if (analysisProgress.value < 26) {
    return { index: 0, title: '正在校正航拍影像...', detail: '读取画面尺度并消除无人机镜头畸变' }
  }
  if (analysisProgress.value < 56) {
    return { index: 1, title: '正在定位道路车辆...', detail: '扫描道路区域，提取全部车辆候选目标' }
  }
  if (analysisProgress.value < 83) {
    return { index: 2, title: '正在建立车辆关联...', detail: '跨帧匹配车辆运动状态与唯一轨迹 ID' }
  }
  return { index: 3, title: '正在渲染标注图层...', detail: '合并检测框、类别信息与车辆轨迹' }
})

const outputAsset = computed(() => (resultKind.value === 'video' ? sampleVideoResult : sampleImageResult))
const outputFilename = computed(() =>
  resultKind.value === 'video' ? 'argus-vehicle-annotation.mp4' : 'argus-vehicle-annotation.jpg',
)

function formatSize(size) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function openFilePicker() {
  fileInput.value?.click()
}

function useFile(file) {
  if (!file) return
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  if (!isVideo && !isImage) return

  if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl)
  clearInterval(analysisTimer)
  selectedFileUrl = URL.createObjectURL(file)
  selectedFile.value = {
    name: file.name,
    size: formatSize(file.size),
    kind: isVideo ? 'video' : 'image',
    previewUrl: selectedFileUrl,
  }
  clearInterval(uploadTimer)
  isUploading.value = true
  uploadProgress.value = 5
  resultReady.value = false
  isAnalyzing.value = false
  analysisProgress.value = 0
  uploadTimer = window.setInterval(() => {
    uploadProgress.value = Math.min(uploadProgress.value + Math.ceil(Math.random() * 25), 100)
    if (uploadProgress.value === 100) {
      clearInterval(uploadTimer)
      window.setTimeout(() => {
        isUploading.value = false
      }, 260)
    }
  }, 90)
}

function handleFileChange(event) {
  useFile(event.target.files?.[0])
  event.target.value = ''
}

function handleDrop(event) {
  isDragging.value = false
  useFile(event.dataTransfer.files?.[0])
}

function clearFile() {
  clearInterval(uploadTimer)
  clearInterval(analysisTimer)
  selectedFile.value = null
  isUploading.value = false
  uploadProgress.value = 0
  isAnalyzing.value = false
  resultReady.value = false
  analysisProgress.value = 0
  if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl)
  selectedFileUrl = ''
}

function startInference() {
  if (!selectedFile.value) {
    openFilePicker()
    return
  }
  clearInterval(analysisTimer)
  isAnalyzing.value = true
  resultReady.value = false
  analysisProgress.value = 12
  analysisTimer = window.setInterval(() => {
    analysisProgress.value = Math.min(analysisProgress.value + 25 + Math.ceil(Math.random() * 11), 100)
    if (analysisProgress.value === 100) {
      clearInterval(analysisTimer)
      window.setTimeout(() => {
        resultKind.value = selectedFile.value.kind
        resultRun.value += 1
        isAnalyzing.value = false
        resultReady.value = true
      }, 80)
    }
  }, 20)
}

function resetDemo() {
  clearInterval(analysisTimer)
  isAnalyzing.value = false
  resultReady.value = false
  analysisProgress.value = 0
}

function handlePreviewError() {
  clearFile()
}

onBeforeUnmount(() => {
  clearInterval(analysisTimer)
  clearInterval(uploadTimer)
  if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl)
})
</script>

<style scoped>
.upload-view {
  --upload-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --upload-title: #f5eee2;
  --upload-copy: rgba(221, 217, 207, 0.76);
  --upload-muted: rgba(192, 189, 181, 0.58);
  --upload-accent: #d7b574;
  --upload-accent-bright: #efcf8c;
  --upload-panel: rgba(10, 16, 25, 0.72);
  --upload-screen: rgba(3, 8, 13, 0.9);
  --upload-line: rgba(211, 183, 129, 0.16);
  --upload-line-strong: rgba(215, 181, 116, 0.44);
  --upload-soft: rgba(215, 181, 116, 0.1);
  --upload-shadow: rgba(0, 0, 0, 0.28);
  min-height: calc(100vh - 56px);
  max-width: 1480px;
  margin: 0 auto;
  padding: clamp(24px, 3vw, 40px) clamp(18px, 3vw, 40px) 48px;
  color: var(--upload-title);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
}

.upload-view.is-light {
  --upload-title: #24211c;
  --upload-copy: rgba(62, 55, 43, 0.78);
  --upload-muted: rgba(87, 79, 66, 0.6);
  --upload-accent: #b67b2c;
  --upload-accent-bright: #955f1c;
  --upload-panel: rgba(255, 252, 246, 0.87);
  --upload-screen: rgba(239, 232, 217, 0.86);
  --upload-line: rgba(156, 116, 55, 0.18);
  --upload-line-strong: rgba(164, 112, 42, 0.44);
  --upload-soft: rgba(190, 139, 63, 0.12);
  --upload-shadow: rgba(70, 52, 22, 0.09);
}

.upload-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 390px);
  gap: 32px 64px;
  align-items: end;
  padding: 4px 6px 34px;
}

.upload-kicker,
.panel-heading p {
  margin: 0;
  color: var(--upload-accent);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.17em;
  line-height: 1.4;
}

.upload-intro h1,
.panel-heading h2 {
  margin: 0;
  color: var(--upload-title);
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-weight: 500;
}

.upload-intro h1 {
  margin-top: 7px;
  font-size: clamp(2rem, 3.6vw, 3.25rem);
  line-height: 1.05;
}

.upload-intro__copy {
  max-width: 43ch;
  margin: 0 0 4px;
  color: var(--upload-copy);
  font-size: 0.92rem;
  line-height: 1.7;
}

.workflow {
  display: grid;
  grid-template-columns: minmax(300px, 0.46fr) minmax(0, 1.54fr);
  gap: clamp(18px, 2vw, 28px);
  align-items: start;
}

.input-panel,
.result-stage {
  border: 1px solid var(--upload-line);
  background: linear-gradient(180deg, color-mix(in srgb, var(--upload-panel) 96%, transparent), var(--upload-panel));
  box-shadow: 0 24px 64px var(--upload-shadow);
}

.input-panel {
  display: grid;
  grid-template-rows: auto minmax(248px, 1fr) auto auto;
  align-content: stretch;
  gap: 20px;
  min-height: 0;
  padding: 24px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--upload-line-strong);
  color: var(--upload-accent-bright);
  font-family: Georgia, serif;
  font-size: 0.86rem;
}

.panel-heading h2 {
  margin-top: 2px;
  font-size: 1.4rem;
  line-height: 1.18;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.drop-zone {
  display: grid;
  justify-items: center;
  gap: 9px;
  min-height: 0;
  align-content: center;
  padding: 28px 22px 24px;
  border: 1px dashed var(--upload-line-strong);
  background: color-mix(in srgb, var(--upload-screen) 74%, transparent);
  color: var(--upload-copy);
  cursor: pointer;
  transition: border-color 220ms var(--upload-ease), background 220ms var(--upload-ease), transform 220ms var(--upload-ease), box-shadow 220ms var(--upload-ease);
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: var(--upload-accent-bright);
  background: color-mix(in srgb, var(--upload-soft) 75%, var(--upload-screen));
  box-shadow: 0 10px 28px color-mix(in srgb, var(--upload-shadow) 78%, transparent);
  transform: translateY(-1px);
}

.drop-zone:focus-visible,
.file-line button:focus-visible,
.infer-button:focus-visible,
.result-actions button:focus-visible,
.result-actions a:focus-visible {
  outline: 2px solid var(--upload-accent-bright);
  outline-offset: 3px;
}

.drop-zone__symbol {
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  margin: 0 0 7px;
  color: var(--upload-accent-bright);
  font-size: 1.38rem;
}

.drop-zone__symbol img,
.empty-stage__mark img {
  display: block;
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.drop-zone strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--upload-title);
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-zone span:not(.drop-zone__symbol),
.drop-zone small {
  color: var(--upload-muted);
  font-size: 0.76rem;
  line-height: 1.45;
}

.drop-zone small { text-align: center; }
.drop-zone__eyebrow { color: var(--upload-accent) !important; font-size: 0.67rem !important; letter-spacing: 0.14em; }
.drop-zone.has-file .drop-zone__eyebrow { animation: uploaded-label 520ms var(--upload-ease) both; }
.drop-zone.has-file strong { animation: uploaded-file 560ms 40ms var(--upload-ease) both; }

.upload-preview {
  position: relative;
  width: min(172px, 100%);
  aspect-ratio: 16 / 9;
  margin-bottom: 5px;
  border: 1px solid var(--upload-line-strong);
  overflow: hidden;
  background: var(--upload-screen);
  animation: uploaded-preview 520ms var(--upload-ease) both;
}

.upload-preview::after {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(239, 207, 140, 0.28);
  pointer-events: none;
}

.upload-preview img,
.upload-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-preview__type {
  position: absolute;
  z-index: 2;
  right: 6px;
  bottom: 6px;
  padding: 3px 5px;
  background: rgba(7, 11, 16, 0.74);
  color: #f2dbab !important;
  font-size: 0.57rem !important;
  letter-spacing: 0.09em;
}

.upload-preview__scan {
  position: absolute;
  z-index: 3;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(239, 207, 140, 0.36) 50%, transparent 55%);
  animation: thumbnail-scan 700ms linear infinite;
}

.file-line {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--upload-line);
}

.file-line__type {
  flex: 0 0 auto;
  padding: 3px 5px;
  border: 1px solid var(--upload-line-strong);
  color: var(--upload-accent);
  font-size: 0.64rem;
  letter-spacing: 0.08em;
}

.file-line__name { overflow: hidden; flex: 1; color: var(--upload-copy); font-size: 0.78rem; text-overflow: ellipsis; white-space: nowrap; }
.file-line__progress { color: var(--upload-accent-bright); font-size: 0.68rem; }
.file-line__track { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; overflow: hidden; background: var(--upload-line); }
.file-line__track i { display: block; width: 100%; height: 100%; background: var(--upload-accent); transform-origin: left; transition: transform 120ms linear; }
.file-line button, .result-actions button, .result-actions a { display: grid; flex: 0 0 auto; place-items: center; border: 0; background: transparent; color: var(--upload-muted); cursor: pointer; font-size: 1rem; text-decoration: none; }
.file-line button:hover, .result-actions button:hover, .result-actions a:hover { color: var(--upload-accent-bright); }
.file-line button:active, .result-actions button:active, .result-actions a:active, .infer-button:active:not(:disabled) { transform: scale(0.96); }

.infer-button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 0;
  border: 1px solid color-mix(in srgb, var(--upload-accent) 80%, transparent);
  background: var(--upload-accent);
  color: #21190c;
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  transition: transform 180ms var(--upload-ease), background 180ms var(--upload-ease), opacity 180ms var(--upload-ease);
}
.infer-button svg { width: 16px; height: 16px; }
.infer-button:hover:not(:disabled) { background: var(--upload-accent-bright); transform: translateY(-1px); }
.infer-button:disabled { cursor: wait; opacity: 0.88; }
.button-spinner { width: 14px; height: 14px; border: 2px solid rgba(33, 25, 12, 0.28); border-top-color: #21190c; border-radius: 50%; animation: upload-spin 0.75s linear infinite; }
.input-ready { display: inline-flex; align-items: center; justify-content: center; gap: 7px; color: var(--upload-accent-bright); font-size: 0.73rem; animation: ready-note 420ms var(--upload-ease) both; }
.input-ready__check, .result-confirmation__check { display: grid; place-items: center; border: 1px solid currentColor; }
.input-ready__check { width: 16px; height: 16px; font-size: 0.65rem; }

.result-stage { display: grid; grid-template-rows: auto auto auto; min-width: 0; min-height: 0; }
.stage-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px 15px; border-bottom: 1px solid var(--upload-line); }
.result-actions { display: flex; gap: 11px; }
.result-actions button, .result-actions a { width: 34px; height: 34px; border: 1px solid var(--upload-line); transition: color 180ms var(--upload-ease), border-color 180ms var(--upload-ease), background 180ms var(--upload-ease), transform 150ms var(--upload-ease); }
.result-actions button:hover, .result-actions a:hover { border-color: var(--upload-line-strong); background: var(--upload-soft); }
.preview-shell { position: relative; display: grid; min-height: 0; place-items: center; padding: 18px; background: var(--upload-screen); }
.media-frame { position: relative; display: grid; justify-self: center; align-self: center; width: min(100%, 640px); height: auto; aspect-ratio: 5 / 4; min-height: 0; margin: auto; border: 1px solid var(--upload-line-strong); overflow: hidden; background: #080b0d; animation: result-arrival 560ms var(--upload-ease) both; }
.media-frame::after { content: ''; position: absolute; inset: 9px; border: 1px solid rgba(232, 207, 151, 0.24); pointer-events: none; }
.media-frame::before { content: ''; position: absolute; z-index: 2; inset: 0; pointer-events: none; background: linear-gradient(180deg, transparent 46%, rgba(239, 207, 140, 0.3) 50%, transparent 54%); transform: translateY(-115%); animation: result-scan 650ms 100ms var(--upload-ease) both; }
.result-media { width: 100%; height: 100%; object-fit: contain; animation: media-reveal 620ms 100ms var(--upload-ease) both; }
.media-badges { position: absolute; z-index: 1; top: 20px; left: 20px; display: flex; flex-wrap: wrap; gap: 7px; }
.media-badges span { padding: 5px 8px; border: 1px solid rgba(239, 207, 140, 0.52); background: rgba(11, 14, 17, 0.7); color: #f2dbab; font-size: 0.63rem; letter-spacing: 0.1em; }
.live-badge { display: inline-flex; align-items: center; gap: 6px; }
.live-badge i { width: 5px; height: 5px; border-radius: 50%; background: #d4e37b; box-shadow: 0 0 6px #d4e37b; }
.annotation-burst { position: absolute; z-index: 3; inset: 50% auto auto 50%; width: 1px; height: 1px; pointer-events: none; }
.annotation-burst i { --burst-distance: 76px; position: absolute; width: 5px; height: 5px; border: 1px solid rgba(245, 223, 170, 0.9); background: rgba(215, 181, 116, 0.7); opacity: 0; transform: rotate(calc(var(--burst-index) * 45deg)) translateY(0) scale(0.4); animation: annotation-burst 620ms 270ms var(--upload-ease) both; }
.result-confirmation { position: absolute; z-index: 4; right: 22px; bottom: 22px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 11px; border: 1px solid rgba(239, 207, 140, 0.48); background: rgba(8, 12, 16, 0.82); color: #f3dba7; animation: result-confirmation 460ms 370ms var(--upload-ease) both; }
.result-confirmation__check { width: 18px; height: 18px; font-size: 0.72rem; }
.result-confirmation strong { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; }

.empty-stage, .analysis-state { display: grid; place-content: center; justify-items: center; align-self: stretch; max-width: 460px; margin: auto; text-align: center; }
.empty-stage { padding: 28px 20px; }
.empty-stage__mark { display: grid; place-items: center; width: 128px; height: 128px; margin-bottom: 23px; color: var(--upload-accent); font-size: 1.7rem; }
.empty-stage p, .analysis-state p { margin: 0; color: var(--upload-accent); font-size: 0.66rem; font-weight: 600; letter-spacing: 0.15em; }
.empty-stage strong, .analysis-state strong { margin-top: 9px; color: var(--upload-title); font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif; font-size: 1.32rem; font-weight: 500; line-height: 1.35; }
.empty-stage span, .analysis-state > span { max-width: 38ch; margin-top: 9px; color: var(--upload-muted); font-size: 0.8rem; line-height: 1.65; }

.analysis-state__radar { position: relative; width: 82px; height: 82px; margin-bottom: 18px; border: 1px solid var(--upload-line-strong); border-radius: 50%; overflow: hidden; }
.analysis-state__radar::before, .analysis-state__radar::after { content: ''; position: absolute; border: 1px solid var(--upload-line); border-radius: 50%; inset: 20px; }
.analysis-state__radar::after { inset: 40px; background: var(--upload-accent); }
.analysis-state__radar span { position: absolute; inset: 0 50% 50% 0; background: conic-gradient(from 45deg, transparent 0deg, rgba(215, 181, 116, 0.45) 85deg, transparent 90deg); transform-origin: 100% 100%; animation: radar-sweep 1.8s linear infinite; }
.analysis-state__radar i { position: absolute; top: 19px; left: 57px; width: 5px; height: 5px; border-radius: 50%; background: var(--upload-accent-bright); box-shadow: 0 0 8px var(--upload-accent-bright); }
.analysis-steps { display: grid; width: min(320px, 100%); grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 18px; }
.analysis-steps span { display: grid; justify-items: center; gap: 5px; color: var(--upload-muted); font-size: 0.61rem; line-height: 1.35; transition: color 220ms var(--upload-ease); }
.analysis-steps i { width: 7px; height: 7px; border: 1px solid var(--upload-line-strong); border-radius: 50%; transition: transform 220ms var(--upload-ease), background 220ms var(--upload-ease), border-color 220ms var(--upload-ease); }
.analysis-steps span.is-active, .analysis-steps span.is-complete { color: var(--upload-accent-bright); }
.analysis-steps span.is-active i { border-color: var(--upload-accent-bright); background: var(--upload-accent-bright); animation: active-step 1s ease-in-out infinite; }
.analysis-steps span.is-complete i { border-color: var(--upload-accent); background: var(--upload-accent); transform: scale(0.82); }
.analysis-progress { width: min(290px, 100%); height: 3px; margin-top: 19px; background: var(--upload-line); overflow: hidden; }
.analysis-progress i { display: block; width: 100%; height: 100%; background: var(--upload-accent); transform-origin: left; transition: transform 0.15s linear; }
.analysis-state small { margin-top: 8px; color: var(--upload-accent-bright); font-size: 0.72rem; }

.stage-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 52px; padding: 0 22px; border-top: 1px solid var(--upload-line); color: var(--upload-muted); font-size: 0.64rem; letter-spacing: 0.09em; }
.stage-footer.is-result { align-items: stretch; min-height: 65px; padding-top: 10px; padding-bottom: 10px; letter-spacing: normal; }
.metric { display: grid; align-content: center; gap: 2px; min-width: 88px; }
.metric span { color: var(--upload-muted); font-size: 0.67rem; }
.metric strong { color: var(--upload-title); font-size: 0.92rem; font-weight: 600; }
.stage-footer.is-result p { max-width: 26ch; margin: 0; color: var(--upload-copy); font-size: 0.72rem; line-height: 1.45; }

@keyframes upload-spin { to { transform: rotate(360deg); } }
@keyframes radar-sweep { to { transform: rotate(360deg); } }
@keyframes uploaded-label { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes uploaded-file { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
@keyframes result-arrival { from { opacity: 0; transform: scale(0.985) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes media-reveal { from { opacity: 0; transform: scale(1.025); } to { opacity: 1; transform: scale(1); } }
@keyframes result-scan { to { transform: translateY(115%); } }
@keyframes active-step { 50% { transform: scale(1.6); } }
@keyframes uploaded-preview { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@keyframes thumbnail-scan { from { transform: translateY(-105%); } to { transform: translateY(105%); } }
@keyframes ready-note { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes annotation-burst { 20% { opacity: 1; } to { opacity: 0; transform: rotate(calc(var(--burst-index) * 45deg)) translateY(calc(var(--burst-distance) * -1)) scale(1); } }
@keyframes result-confirmation { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1080px) {
  .upload-view { max-width: 920px; }
  .workflow { grid-template-columns: 1fr; }
  .input-panel { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto auto auto; align-items: start; }
  .input-panel > .panel-heading, .input-panel > .drop-zone, .input-panel > .file-line { grid-column: 1 / -1; }
  .infer-button, .input-ready { min-height: 50px; }
}

@media (max-width: 780px) {
  .upload-view { padding-top: 22px; }
  .upload-intro { grid-template-columns: 1fr; gap: 14px; padding: 0 4px 26px; }
  .upload-intro__copy { max-width: 54ch; }
}

@media (max-width: 560px) {
  .input-panel { grid-template-columns: 1fr; }
  .input-panel > * { grid-column: auto !important; }
  .stage-header, .preview-shell { padding-left: 14px; padding-right: 14px; }
  .media-frame { width: 100%; max-width: 640px; }
  .stage-footer { align-items: flex-start; flex-wrap: wrap; padding: 14px; }
  .stage-footer.is-result p { flex-basis: 100%; }
  .file-line button, .result-actions button, .result-actions a { width: 44px; height: 44px; }
  .file-line { min-height: 44px; }

  .result-confirmation { right: 16px; bottom: 16px; }
  .drop-zone { min-height: 228px; }
  .drop-zone__symbol { width: 78px; height: 78px; }
  .empty-stage__mark { width: 108px; height: 108px; }
}

@media (prefers-reduced-motion: reduce) {
  .drop-zone, .infer-button, .analysis-progress i, .file-line__track i, .analysis-steps span, .analysis-steps i { transition: none; }
  .button-spinner, .analysis-state__radar span, .drop-zone.has-file .drop-zone__eyebrow, .drop-zone.has-file strong, .upload-preview, .upload-preview__scan, .media-frame, .media-frame::before, .result-media, .analysis-steps span.is-active i, .input-ready, .annotation-burst i, .result-confirmation { animation: none; }
}
</style>
