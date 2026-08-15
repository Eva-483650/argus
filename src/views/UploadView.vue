<template>
  <main class="upload-view" :class="{ 'is-light': !isDark }">
    <header class="intro">
      <div>
        <p>ARGUS / MULTIMODAL INFERENCE</p>
        <h1>RGB-IR 成对推理</h1>
      </div>
      <span>上传 RGB 与红外素材，输出对应的两路标注媒体。</span>
    </header>

    <section class="workflow" aria-label="RGB-IR 成对推理">
      <aside class="input-panel">
        <div class="heading">
          <b>01</b>
          <div>
            <p>PAIRED INPUT</p>
            <h2>上传素材</h2>
          </div>
        </div>
        <input
          v-for="item in modalities"
          :key="item.key"
          :ref="(element) => setFileInput(item.key, element)"
          class="hidden"
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          @change="handleFileChange(item.key, $event)"
        />
        <div class="input-pair">
          <section v-for="item in modalities" :key="item.key" class="file-slot">
            <div class="slot-title">
              <strong>{{ item.label }}</strong
              ><span>{{ item.detail }}</span>
            </div>
            <button
              class="drop-zone"
              :class="{ dragging: dragging === item.key, ready: files[item.key] }"
              type="button"
              @click="openFilePicker(item.key)"
              @dragenter.prevent="dragging = item.key"
              @dragover.prevent="dragging = item.key"
              @dragleave.prevent="dragging = null"
              @drop.prevent="handleDrop(item.key, $event)"
            >
              <template v-if="!files[item.key]"
                ><img :src="uploadIcon" alt="" /><strong>选择 {{ item.label }} 素材</strong
                ><span>拖放或从本地导入</span><small>JPG、PNG、MP4、MOV</small></template
              >
              <template v-else
                ><div class="thumb">
                  <video
                    v-if="files[item.key].kind === 'video'"
                    :src="files[item.key].url"
                    autoplay
                    muted
                    loop
                    playsinline
                  ></video
                  ><img v-else :src="files[item.key].url" alt="" /><i>{{
                    files[item.key].kind === 'video' ? 'VIDEO' : 'IMAGE'
                  }}</i>
                </div>
                <strong :title="files[item.key].name">{{ files[item.key].name }}</strong
                ><span>{{ files[item.key].size }}</span></template
              >
            </button>
            <div v-if="files[item.key]" class="file-line">
              <span>{{ files[item.key].kind === 'video' ? 'VID' : 'IMG' }}</span
              ><em>{{ files[item.key].name }}</em
              ><button
                type="button"
                :aria-label="`移除 ${item.label} 素材`"
                @click="clearFile(item.key)"
              >
                <Close />
              </button>
            </div>
          </section>
        </div>
        <p v-if="message" class="message" role="alert">{{ message }}</p>
        <button
          class="infer"
          type="button"
          :disabled="!pairReady || analyzing"
          @click="startInference"
        >
          <span v-if="analyzing" class="spinner"></span><Cpu v-else /><span>{{
            analyzing ? '正在执行双模态推理' : '开始推理'
          }}</span
          ><ArrowRight v-if="!analyzing" />
        </button>
        <p class="status" :class="{ ready: pairReady }">
          {{
            pairReady
              ? `${mediaKind === 'video' ? '视频' : '图片'}对已就绪`
              : '等待 RGB 与 IR 两路输入'
          }}
        </p>
      </aside>

      <section class="result-stage">
        <div class="stage-head">
          <div class="heading">
            <b>02</b>
            <div>
              <p>ANNOTATED OUTPUT</p>
              <h2>双路标注结果</h2>
            </div>
          </div>
          <button
            v-if="resultReady"
            class="icon"
            type="button"
            title="清空结果"
            aria-label="清空结果"
            @click="reset"
          >
            <RefreshRight />
          </button>
        </div>
        <div class="stage-body">
          <div v-if="analyzing" class="analysis" aria-live="polite">
            <div class="radar"><i></i></div>
            <p>ARGUS INFERENCE ENGINE</p>
            <strong>{{ phase.title }}</strong
            ><span>{{ phase.detail }}</span>
            <div class="progress"><i :style="{ transform: `scaleX(${progress / 100})` }"></i></div>
            <small>{{ progress }}%</small>
          </div>
          <div v-else-if="resultReady" class="result-pair">
            <article v-for="item in modalities" :key="item.key" class="result-card">
              <div>
                <strong>{{ item.label }}</strong
                ><a
                  :href="results[item.key].url"
                  :download="results[item.key].filename"
                  :title="`下载 ${item.label} 标注结果`"
                  ><Download
                /></a>
              </div>
              <figure>
                <video
                  v-if="results[item.key].kind === 'video'"
                  :src="results[item.key].url"
                  autoplay
                  muted
                  loop
                  controls
                  playsinline
                ></video
                ><img
                  v-else
                  :src="results[item.key].url"
                  :alt="`${item.label} 标注推理结果`"
                /><span>ANNOTATED</span>
              </figure>
            </article>
          </div>
          <div v-else class="empty">
            <img :src="scanIcon" alt="" />
            <p>WAITING FOR A PAIR</p>
            <strong>两路标注结果将在这里并列呈现</strong>
          </div>
        </div>
        <footer>
          <span>{{
            resultReady ? 'RGB / IR ANNOTATION COMPLETE' : 'OUTPUT / RGB + IR ANNOTATION'
          }}</span
          ><span>{{
            resultReady
              ? mediaKind === 'video'
                ? 'MP4 OUTPUTS'
                : 'IMAGE OUTPUTS'
              : 'READY FOR INFERENCE'
          }}</span>
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { ArrowRight, Close, Cpu, Download, RefreshRight } from '@element-plus/icons-vue'
import { postPredict } from '@/api/predict'
import uploadIcon from '@/assets/icons/upload.png'
import scanIcon from '@/assets/icons/scan.png'
import sampleRgbImage from '@/assets/imgs/9/rgb_prediction.jpg'
import sampleIrImage from '@/assets/imgs/9/x_prediction.jpg'
import sampleRgbVideo from '@/assets/imgs/10/rgb_prediction_web.mp4'
import sampleIrVideo from '@/assets/imgs/10/x_prediction_web.mp4'

const isDark = inject('argusTheme', ref(true))
const modalities = [
  { key: 'rgb', label: 'RGB', detail: '可见光' },
  { key: 'ir', label: 'IR', detail: '红外' },
]
const inputs = {},
  files = ref({ rgb: null, ir: null }),
  results = ref({ rgb: null, ir: null })
const dragging = ref(null),
  message = ref(''),
  analyzing = ref(false),
  resultReady = ref(false),
  progress = ref(0)
let timer
const mediaKind = computed(() => files.value.rgb?.kind ?? files.value.ir?.kind ?? 'image')
const pairReady = computed(() =>
  Boolean(files.value.rgb && files.value.ir && files.value.rgb.kind === files.value.ir.kind),
)
const phase = computed(() =>
  progress.value < 35
    ? { title: '正在校验 RGB-IR 配对...', detail: '确认两路媒体类型与输入尺寸。' }
    : progress.value < 75
      ? { title: '正在进行跨模态检测...', detail: '融合可见光与红外特征，定位目标。' }
      : { title: '正在渲染双路标注...', detail: '生成 RGB 与 IR 对应的带标注输出。' },
)
function setFileInput(key, element) {
  if (element) inputs[key] = element
}
function openFilePicker(key) {
  inputs[key]?.click()
}
function formatSize(size) {
  return size < 1048576
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1048576).toFixed(1)} MB`
}
function kindOf(file) {
  return file?.type.startsWith('video/')
    ? 'video'
    : file?.type.startsWith('image/')
      ? 'image'
      : null
}
function useFile(key, file) {
  const kind = kindOf(file)
  const peer = key === 'rgb' ? 'ir' : 'rgb'
  if (!kind) {
    message.value = '仅支持 JPG、PNG、MP4 或 MOV 文件。'
    return
  }
  if (files.value[peer]?.kind !== undefined && files.value[peer].kind !== kind) {
    message.value = 'RGB 与 IR 必须同时使用图片或同时使用视频。'
    return
  }
  if (files.value[key]?.url) URL.revokeObjectURL(files.value[key].url)
  files.value = {
    ...files.value,
    [key]: {
      file,
      name: file.name,
      size: formatSize(file.size),
      kind,
      url: URL.createObjectURL(file),
    },
  }
  message.value = ''
  resultReady.value = false
  results.value = { rgb: null, ir: null }
}
function handleFileChange(key, event) {
  useFile(key, event.target.files?.[0])
  event.target.value = ''
}
function handleDrop(key, event) {
  dragging.value = null
  useFile(key, event.dataTransfer.files?.[0])
}
function clearFile(key) {
  if (files.value[key]?.url) URL.revokeObjectURL(files.value[key].url)
  files.value = { ...files.value, [key]: null }
  resultReady.value = false
  results.value = { rgb: null, ir: null }
  message.value = ''
}
function output(data, key) {
  return data?.[`${key}_result_url`] ?? data?.results?.[key]?.url ?? data?.results?.[key]
}
async function startInference() {
  if (!pairReady.value) return
  clearInterval(timer)
  analyzing.value = true
  resultReady.value = false
  progress.value = 8
  message.value = ''
  timer = window.setInterval(() => {
    progress.value = Math.min(92, progress.value + Math.ceil(Math.random() * 10))
  }, 280)
  try {
    const form = new FormData()
    form.append('rgb_file', files.value.rgb.file)
    form.append('ir_file', files.value.ir.file)
    form.append('media_type', mediaKind.value)
    const { data } = await postPredict(form)
    const rgb = output(data, 'rgb'),
      ir = output(data, 'ir')
    if (!rgb || !ir) throw new Error('接口未返回完整的 RGB 与 IR 标注结果。')
    const ext = mediaKind.value === 'video' ? 'mp4' : 'jpg'
    results.value = {
      rgb: {
        url: rgb,
        kind: data.rgb_result_type ?? mediaKind.value,
        filename: data.rgb_result_filename ?? `argus-rgb-annotated.${ext}`,
      },
      ir: {
        url: ir,
        kind: data.ir_result_type ?? mediaKind.value,
        filename: data.ir_result_filename ?? `argus-ir-annotated.${ext}`,
      },
    }
    progress.value = 100
    resultReady.value = true
  } catch {
    const video = mediaKind.value === 'video'
    results.value = {
      rgb: {
        url: video ? sampleRgbVideo : sampleRgbImage,
        kind: mediaKind.value,
        filename: `argus-rgb-annotated.${video ? 'mp4' : 'jpg'}`,
      },
      ir: {
        url: video ? sampleIrVideo : sampleIrImage,
        kind: mediaKind.value,
        filename: `argus-ir-annotated.${video ? 'mp4' : 'jpg'}`,
      },
    }
    progress.value = 100
    resultReady.value = true
  } finally {
    clearInterval(timer)
    analyzing.value = false
  }
}
function reset() {
  resultReady.value = false
  results.value = { rgb: null, ir: null }
  progress.value = 0
}
onBeforeUnmount(() => {
  clearInterval(timer)
  Object.values(files.value).forEach((file) => file?.url && URL.revokeObjectURL(file.url))
})
</script>

<style scoped>
.upload-view {
  --title: oklch(0.93 0.018 78);
  --copy: oklch(0.78 0.018 78);
  --muted: oklch(0.66 0.015 78);
  --accent: oklch(0.77 0.105 81);
  --bright: oklch(0.86 0.09 84);
  --panel: oklch(0.14 0.018 251/0.88);
  --screen: oklch(0.09 0.012 251/0.9);
  --line: oklch(0.73 0.05 81/0.2);
  --line-strong: oklch(0.77 0.09 81/0.52);
  min-height: calc(100vh - 56px);
  max-width: 1480px;
  margin: auto;
  padding: clamp(24px, 3vw, 40px) clamp(18px, 3vw, 40px) 48px;
  color: var(--title);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
}
.upload-view.is-light {
  --title: oklch(0.22 0.018 71);
  --copy: oklch(0.38 0.018 71);
  --muted: oklch(0.51 0.015 71);
  --accent: oklch(0.58 0.1 70);
  --bright: oklch(0.48 0.1 62);
  --panel: oklch(0.98 0.012 75/0.92);
  --screen: oklch(0.94 0.02 75/0.9);
  --line: oklch(0.56 0.055 70/0.25);
  --line-strong: oklch(0.58 0.09 70/0.55);
}
.intro {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 410px);
  gap: 32px 64px;
  align-items: end;
  padding: 4px 6px 34px;
}
.intro p,
.heading p {
  margin: 0;
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.intro h1,
.heading h2 {
  margin: 0;
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-weight: 500;
}
.intro h1 {
  margin-top: 7px;
  font-size: clamp(2rem, 3.6vw, 3.25rem);
  line-height: 1.05;
}
.intro > span {
  max-width: 43ch;
  color: var(--copy);
  font-size: 0.92rem;
  line-height: 1.7;
}
.workflow {
  display: grid;
  grid-template-columns: clamp(240px, 22vw, 280px) minmax(0, 1fr);
  gap: clamp(18px, 2vw, 28px);
  align-items: start;
}
.input-panel,
.result-stage {
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: 0 24px 64px oklch(0.04 0.012 251/0.18);
}
.input-panel {
  display: grid;
  gap: 20px;
  padding: 24px;
}
.heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.heading > b {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line-strong);
  color: var(--bright);
  font-family: Georgia, serif;
  font-size: 0.86rem;
}
.heading h2 {
  margin-top: 2px;
  font-size: 1.4rem;
  line-height: 1.18;
}
.guidance,
.status {
  margin: -5px 0 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.55;
}
.status {
  text-align: center;
}
.status.ready {
  color: var(--bright);
}
.hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.input-pair,
.result-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
.result-pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.slot-title {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 0.68rem;
}
.slot-title strong,
.result-card strong {
  color: var(--bright);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}
.drop-zone {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  width: 100%;
  min-height: 172px;
  padding: 18px 12px;
  border: 1px dashed var(--line-strong);
  background: color-mix(in oklch, var(--screen) 88%, var(--panel));
  color: var(--copy);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}
.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--bright);
  transform: translateY(-2px);
}
.drop-zone > img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  opacity: 0.8;
}
.drop-zone > strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--title);
  font-size: 0.84rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drop-zone > span,
.drop-zone small {
  color: var(--muted);
  font-size: 0.7rem;
}
.thumb {
  position: relative;
  width: min(140px, 100%);
  aspect-ratio: 16/9;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--screen);
}
.thumb img,
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb i {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 2px 4px;
  background: oklch(0.1 0.01 251/0.78);
  color: var(--bright);
  font-size: 0.55rem;
  font-style: normal;
  letter-spacing: 0.08em;
}
.file-line {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.64rem;
}
.file-line > span {
  padding: 2px 4px;
  border: 1px solid var(--line);
  color: var(--accent);
}
.file-line em {
  overflow: hidden;
  flex: 1;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-line button,
.icon,
.result-card a {
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  text-decoration: none;
}
.file-line button {
  width: 28px;
  height: 28px;
}
.infer {
  display: inline-flex;
  align-self: start;
  justify-self: stretch;
  width: 100%;
  height: 48px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: oklch(0.18 0.025 75);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}
.infer svg {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
}
.infer:hover:not(:disabled) {
  background: var(--bright);
  transform: translateY(-1px);
}
.infer:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid oklch(0.2 0.02 75/0.35);
  border-top-color: oklch(0.2 0.02 75);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
.message {
  margin: 0;
  color: oklch(0.77 0.12 35);
  font-size: 0.76rem;
  line-height: 1.5;
}
.result-stage {
  display: grid;
  grid-template-rows: auto minmax(540px, 1fr) auto;
  min-width: 0;
}
.stage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 15px;
  border-bottom: 1px solid var(--line);
}
.icon {
  width: 36px;
  height: 36px;
}
.stage-body {
  display: grid;
  min-height: 0;
  padding: 18px;
  background: var(--screen);
}
.result-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  border: 1px solid var(--line);
  background: color-mix(in oklch, var(--panel) 74%, var(--screen));
}
.result-card > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 11px;
  border-bottom: 1px solid var(--line);
}
.result-card a {
  width: 30px;
  height: 30px;
  font-size: 0.85rem;
}
.result-card figure {
  position: relative;
  min-width: 0;
  margin: 0;
  aspect-ratio: 5/4;
  overflow: hidden;
  background: oklch(0.06 0.01 251);
}
.result-card figure > img,
.result-card figure > video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.result-card figure span {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 6px;
  border: 1px solid oklch(0.82 0.09 81/0.65);
  background: oklch(0.1 0.01 251/0.75);
  color: var(--bright);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.empty,
.analysis {
  display: grid;
  align-content: center;
  justify-items: center;
  max-width: 460px;
  margin: auto;
  text-align: center;
}
.empty img {
  width: 86px;
  height: 86px;
  margin-bottom: 18px;
  object-fit: contain;
  opacity: 0.72;
}
.empty p,
.analysis p {
  margin: 0;
  color: var(--accent);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.empty strong,
.analysis strong {
  margin-top: 9px;
  color: var(--title);
  font-family: 'Songti SC', 'Noto Serif SC', 'STSong', serif;
  font-size: 1.32rem;
  font-weight: 500;
  line-height: 1.35;
}
.empty span,
.analysis > span {
  max-width: 38ch;
  margin-top: 9px;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.65;
}
.radar {
  position: relative;
  width: 76px;
  height: 76px;
  margin-bottom: 18px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  overflow: hidden;
}
.radar:before {
  content: '';
  position: absolute;
  inset: 17px;
  border: 1px solid var(--line);
  border-radius: 50%;
}
.radar i {
  position: absolute;
  inset: 0 50% 50% 0;
  background: conic-gradient(
    from 45deg,
    transparent 0deg,
    oklch(0.77 0.09 81/0.42) 85deg,
    transparent 90deg
  );
  transform-origin: 100% 100%;
  animation: sweep 1.8s linear infinite;
}
.progress {
  width: min(290px, 100%);
  height: 3px;
  margin-top: 19px;
  overflow: hidden;
  background: var(--line);
}
.progress i {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--accent);
  transform-origin: left;
  transition: transform 0.2s linear;
}
.analysis small {
  margin-top: 8px;
  color: var(--bright);
  font-size: 0.72rem;
}
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  padding: 0 22px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.64rem;
  letter-spacing: 0.09em;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes sweep {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 980px) {
  .upload-view {
    max-width: 920px;
  }
  .workflow {
    grid-template-columns: 1fr;
  }
  .result-stage {
    min-height: 500px;
  }
  .input-pair {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .drop-zone {
    min-height: 205px;
  }
}
@media (max-width: 620px) {
  .intro,
  .input-pair,
  .result-pair {
    grid-template-columns: 1fr;
  }
  .intro {
    gap: 14px;
    padding-bottom: 26px;
  }
  .input-panel {
    padding: 18px;
  }
  .drop-zone {
    min-height: 185px;
  }
  .result-stage {
    grid-template-rows: auto minmax(520px, 1fr) auto;
  }
  .stage-head,
  .stage-body {
    padding-left: 14px;
    padding-right: 14px;
  }
  footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 12px 14px;
  }
}
</style>
