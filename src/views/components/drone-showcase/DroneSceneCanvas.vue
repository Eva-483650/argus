<template>
  <div ref="containerRef" class="drone-scene"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  themeMode: {
    type: String,
    default: 'dark',
  },
})

const emit = defineEmits(['ready'])

const containerRef = ref(null)

let scene
let camera
let renderer
let controls
let model
let animationId

const sceneState = {
  intro: 0,
  overview: 0,
  detail: 0,
  emotion: 0,
}

const themeState = {
  blend: props.themeMode === 'light' ? 1 : 0,
}

const framing = {
  center: new THREE.Vector3(),
  baseScale: new THREE.Vector3(1, 1, 1),
  distance: 1,
}

const materialNodes = []

const clamp01 = (value) => THREE.MathUtils.clamp(value, 0, 1)
const mix = (start, end, progress) => THREE.MathUtils.lerp(start, end, progress)
const colorFromHex = (hex) => new THREE.Color(hex)

const themePalette = {
  dark: {
    fog: colorFromHex('#060c12'),
    key: colorFromHex('#ffffff'),
    rim: colorFromHex('#7abfff'),
    fill: colorFromHex('#f7fbff'),
    colorA: colorFromHex('#8c939f'),
    colorB: colorFromHex('#d5dde7'),
    colorC: colorFromHex('#9ec9ff'),
  },
  light: {
    fog: colorFromHex('#f7f9fc'),
    key: colorFromHex('#f7faff'),
    rim: colorFromHex('#c7d8ff'),
    fill: colorFromHex('#ffffff'),
    colorA: colorFromHex('#9aa0a8'),
    colorB: colorFromHex('#fcfdff'),
    colorC: colorFromHex('#b7c9f2'),
  },
}

let ambientLight
let hemiLight
let keyLight
let rimLight
let fillLight

const tmpColor = new THREE.Color()

const fitCameraToObject = (object) => {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)

  if (!maxSize) return

  framing.center.copy(center)
  framing.baseScale.copy(object.scale)

  const fitHeightDistance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  const fitWidthDistance = fitHeightDistance / camera.aspect
  framing.distance = 1.18 * Math.max(fitHeightDistance, fitWidthDistance)

  camera.near = Math.max(framing.distance / 100, 0.1)
  camera.far = framing.distance * 120
  camera.updateProjectionMatrix()
}

const applyLightsForTheme = () => {
  if (!scene || !ambientLight) return

  const dark = themePalette.dark
  const light = themePalette.light
  const blend = themeState.blend

  scene.fog.color.copy(dark.fog.clone().lerp(light.fog, blend))
  ambientLight.intensity = mix(1.45, 1.85, blend)
  hemiLight.intensity = mix(1.12, 0.72, blend)

  keyLight.color.copy(tmpColor.copy(dark.key).lerp(light.key, blend))
  rimLight.color.copy(tmpColor.copy(dark.rim).lerp(light.rim, blend))
  fillLight.color.copy(tmpColor.copy(dark.fill).lerp(light.fill, blend))

  keyLight.intensity = mix(2.8, 2.15, blend)
  rimLight.intensity = mix(2.55, 1.1, blend)
  fillLight.intensity = mix(0.92, 0.82, blend)
}

const applyMaterialState = () => {
  if (!materialNodes.length) return

  const themeBlend = themeState.blend
  const polish = clamp01(sceneState.overview * 0.55 + sceneState.detail * 0.7 + sceneState.emotion)

  const darkTarget = themePalette.dark.colorA
    .clone()
    .lerp(themePalette.dark.colorB, clamp01(sceneState.detail + sceneState.overview * 0.35))
    .lerp(themePalette.dark.colorC, clamp01(sceneState.emotion * 0.9))

  const lightTarget = themePalette.light.colorA
    .clone()
    .lerp(themePalette.light.colorB, clamp01(sceneState.detail + sceneState.overview * 0.35))
    .lerp(themePalette.light.colorC, clamp01(sceneState.emotion * 0.72))

  materialNodes.forEach(({ material, baseColor, baseMetalness, baseRoughness, emissive }) => {
    const targetColor = darkTarget.clone().lerp(lightTarget, themeBlend)
    const blendedBase = baseColor.clone().lerp(targetColor, 0.48 + polish * 0.35)

    material.color.copy(blendedBase)

    if ('metalness' in material) {
      material.metalness = THREE.MathUtils.clamp(baseMetalness + 0.1 + polish * 0.16, 0, 1)
    }

    if ('roughness' in material) {
      const roughnessOffset = mix(-0.1, 0.06, themeBlend) - polish * 0.12
      material.roughness = THREE.MathUtils.clamp(baseRoughness + roughnessOffset, 0.05, 0.92)
    }

    if ('emissive' in material) {
      material.emissive.copy(emissive)
      material.emissiveIntensity = 0.02 + sceneState.emotion * 0.08
    }

    material.needsUpdate = true
  })
}

const applySceneState = () => {
  if (!model) return

  const intro = clamp01(sceneState.intro)
  const overview = clamp01(sceneState.overview)
  const detail = clamp01(sceneState.detail)
  const emotion = clamp01(sceneState.emotion)

  const overallLift = overview * 0.18 + detail * 0.22 + emotion * 0.34
  const introArc = Math.sin(intro * Math.PI)

  // =========================
  // 1) 模型首屏轨迹：右上 -> 绕弧线 -> 左下
  // =========================
  const modelIntroAngle = mix(Math.PI * 0.18, Math.PI * 1.28, intro)
  const modelIntroRadiusX = mix(3.25, 1.7, intro)
  const modelIntroRadiusY = mix(2.35, 1.55, intro)

  const introSweepX = Math.cos(modelIntroAngle) * modelIntroRadiusX
  const introSweepY = Math.sin(modelIntroAngle) * modelIntroRadiusY
  const introSweepZ = mix(1.02, 0.18, intro) - introArc * 0.16

  // =========================
  // 2) 模型旋转
  // =========================
  model.rotation.x =
    0.24 - intro * 0.26 + introArc * 0.12 + overview * 0.08 + detail * 0.3 + emotion * 0.26

  model.rotation.y =
    -0.58 - intro * 1.12 + introArc * 0.34 + overview * 0.78 + detail * 0.62 + emotion * 0.4

  model.rotation.z = 0.28 - intro * 0.46 + introArc * 0.22 + detail * 0.18 - emotion * 0.16

  // =========================
  // 3) 模型位置
  // =========================
  model.position.set(
    framing.center.x + introSweepX + overview * 0.52 - detail * 0.18 + emotion * 0.24 - 0.12,
    framing.center.y + introSweepY - overallLift + intro * 0.18,
    framing.center.z + introSweepZ - detail * 0.52 - emotion * 0.92,
  )

  // =========================
  // 4) 模型缩放
  // =========================
  const scaleFactor = 1.74 - intro * 0.82 + introArc * 0.12 + detail * 0.07 + emotion * 0.12

  model.scale.copy(framing.baseScale).multiplyScalar(scaleFactor)

  // =========================
  // 5) 相机首屏轨迹：同步沿圆弧跟拍
  //    比模型更远、更高一点，形成“宣传片式跟镜”
  // =========================
  const cameraIntroAngle = mix(Math.PI * 0.1, Math.PI * 1.18, intro)
  const cameraIntroRadiusX = mix(framing.distance * 2.45, framing.distance * 1.52, intro)
  const cameraIntroRadiusY = mix(framing.distance * 1.9, framing.distance * 1.22, intro)

  const introCamera = {
    x: framing.center.x + Math.cos(cameraIntroAngle) * cameraIntroRadiusX,
    y: framing.center.y + Math.sin(cameraIntroAngle) * cameraIntroRadiusY,
    z:
      framing.center.z +
      mix(framing.distance * 1.18, framing.distance * 0.72, intro) +
      introArc * framing.distance * 0.12,
  }

  // Hero阶段镜头：停在左下区域附近，继续为后续段落过渡服务
  const heroCamera = {
    x: framing.center.x - framing.distance * 1.18,
    y: framing.center.y - framing.distance * 0.96,
    z: framing.center.z + framing.distance * 0.86,
  }

  camera.position.set(
    mix(introCamera.x, heroCamera.x, intro) -
      detail * framing.distance * 0.16 +
      emotion * framing.distance * 0.12,
    mix(introCamera.y, heroCamera.y, intro) +
      overview * framing.distance * 0.08 +
      detail * framing.distance * 0.16,
    mix(introCamera.z, heroCamera.z, intro) -
      overview * framing.distance * 0.08 -
      detail * framing.distance * 0.32 -
      emotion * framing.distance * 0.38,
  )

  // =========================
  // 6) 镜头目标点：跟随模型，但带一点延迟感
  //    这样看起来更像真实摄影机在追踪主体
  // =========================
  const targetIntroX =
    framing.center.x + Math.cos(modelIntroAngle + 0.18) * 0.72 + mix(0.52, -0.38, intro)

  const targetIntroY =
    framing.center.y + Math.sin(modelIntroAngle + 0.12) * 0.36 + mix(0.34, -0.26, intro)

  const targetIntroZ = framing.center.z + introArc * 0.08

  const targetHero = {
    x: framing.center.x - 1.14 + detail * 0.2 + emotion * 0.14,
    y: framing.center.y - 0.94 - detail * 0.1 - emotion * 0.04,
    z: framing.center.z - detail * 0.18 - emotion * 0.24,
  }

  controls.target.set(
    mix(targetIntroX, targetHero.x, intro),
    mix(targetIntroY, targetHero.y, intro),
    mix(targetIntroZ, targetHero.z, intro),
  )

  controls.update()
  applyLightsForTheme()
  applyMaterialState()
}

const render = () => {
  animationId = requestAnimationFrame(render)
  applySceneState()
  renderer.render(scene, camera)
}

const handleResize = () => {
  const container = containerRef.value
  if (!container || !camera || !renderer) return

  const width = container.clientWidth
  const height = container.clientHeight
  if (!width || !height) return

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  if (model) {
    fitCameraToObject(model)
    applySceneState()
  }
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(props.themeMode === 'light' ? '#f7f9fc' : '#060c12', 16, 30)

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.enableRotate = false

  ambientLight = new THREE.AmbientLight(0xffffff, 1.45)
  hemiLight = new THREE.HemisphereLight('#b9d8ff', '#050a16', 1.12)
  keyLight = new THREE.DirectionalLight('#eef6ff', 2.8)
  rimLight = new THREE.DirectionalLight('#6d7dff', 2.55)
  fillLight = new THREE.DirectionalLight('#7fe7ff', 0.92)

  keyLight.position.set(8, 7, 10)
  rimLight.position.set(-9, 3, -6)
  fillLight.position.set(-2, -4, 7)

  scene.add(ambientLight, hemiLight, keyLight, rimLight, fillLight)

  const loader = new GLTFLoader()
  loader.load(
    '/models/glbfile.glb',
    (gltf) => {
      model = gltf.scene

      model.traverse((child) => {
        if (!child.isMesh) return

        child.castShadow = false
        child.receiveShadow = false

        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (!material || materialNodes.some((node) => node.material === material)) return

          materialNodes.push({
            material,
            baseColor: material.color?.clone?.() || new THREE.Color('#ffffff'),
            baseMetalness: material.metalness ?? 0.65,
            baseRoughness: material.roughness ?? 0.35,
            emissive: material.emissive?.clone?.() || new THREE.Color('#000000'),
          })
        })
      })

      scene.add(model)
      fitCameraToObject(model)
      applySceneState()

      emit('ready', {
        sceneState,
        handleResize,
        playIntro: () => gsap.to(sceneState, { intro: 1, duration: 4.8, ease: 'power4.inOut' }),
      })
    },
    undefined,
    (error) => {
      console.error('Model load failed', error)
    },
  )

  window.addEventListener('resize', handleResize)
  render()
})

watch(
  () => props.themeMode,
  (mode) => {
    gsap.to(themeState, {
      blend: mode === 'light' ? 1 : 0,
      duration: 0.7,
      ease: 'power2.out',
    })
  },
)

onBeforeUnmount(() => {
  const container = containerRef.value

  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationId)
  controls?.dispose()

  if (model) {
    model.traverse((child) => {
      if (!child.isMesh) return

      child.geometry?.dispose()

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.())
      } else {
        child.material?.dispose?.()
      }
    })
  }

  renderer?.dispose()
  if (renderer?.domElement && container?.contains(renderer.domElement)) {
    container.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.drone-scene {
  width: 100%;
  height: 100%;
}
</style>
