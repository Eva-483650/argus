<template>
  <div ref="containerRef" class="viewer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const containerRef = ref(null)

let scene = null
let camera = null
let renderer = null
let controls = null
let model = null
let animationId = null
let handleResize = null

function getContainerSize(container) {
  const rect = container.getBoundingClientRect()
  return {
    width: Math.max(rect.width, 1),
    height: Math.max(rect.height, 1)
  }
}

function frameModel(object) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.1)

  object.position.sub(center)

  const fov = THREE.MathUtils.degToRad(camera.fov)
  const distance = (maxDim / 2) / Math.tan(fov / 2)
  const paddedDistance = distance * 1.8

  camera.position.set(maxDim * 0.6, maxDim * 0.35, paddedDistance)
  camera.near = Math.max(maxDim / 100, 0.01)
  camera.far = Math.max(maxDim * 100, 50)
  camera.updateProjectionMatrix()

  controls.target.set(0, 0, 0)
  controls.minDistance = maxDim * 0.8
  controls.maxDistance = maxDim * 8
  controls.update()
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const { width, height } = getContainerSize(container)

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#eef3fb')

  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
  camera.position.set(0, 0.2, 3)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 1

  scene.add(new THREE.AmbientLight(0xffffff, 2.4))

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.8)
  scene.add(hemisphereLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 3)
  keyLight.position.set(5, 6, 5)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xbdd7ff, 1.6)
  fillLight.position.set(-4, 2, 3)
  scene.add(fillLight)

  const loader = new GLTFLoader()
  loader.load(
    '/models/glbfile.glb',
    (gltf) => {
      model = gltf.scene

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(model)
      frameModel(model)
      model.rotation.x = -0.2
      model.rotation.y = Math.PI / 4
      console.log('Model loaded:', gltf)
    },
    undefined,
    (error) => {
      console.error('Failed to load model:', error)
    }
  )

  handleResize = () => {
    if (!container || !camera || !renderer) return
    const next = getContainerSize(container)
    camera.aspect = next.width / next.height
    camera.updateProjectionMatrix()
    renderer.setSize(next.width, next.height)
  }

  window.addEventListener('resize', handleResize)

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (model) {
      model.rotation.y += 0.003
    }

    controls.update()
    renderer.render(scene, camera)
  }

  animate()
})

onBeforeUnmount(() => {
  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  controls?.dispose()
  renderer?.dispose()

  if (renderer?.domElement && containerRef.value?.contains(renderer.domElement)) {
    containerRef.value.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.viewer {
  width: 100%;
  height: calc(100vh - 82px - 56px - 48px);
  min-height: 520px;
  overflow: hidden;
}
</style>
