<template>
  <div ref="modelBox" class="content"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const modelBox = ref(null)

let scene
let camera
let renderer
let controls
let model
let animationId

const fitCameraToObject = (object) => {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)

  if (!maxSize) return

  const fitHeightDistance =
    maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  const fitWidthDistance = fitHeightDistance / camera.aspect
  const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance)

  camera.near = Math.max(distance / 100, 0.1)
  camera.far = distance * 100
  camera.updateProjectionMatrix()

  camera.position.copy(center).add(new THREE.Vector3(distance * 0.6, distance * 0.3, distance))
  controls.target.copy(center)
  controls.update()
}

const render = () => {
  animationId = requestAnimationFrame(render)
  controls.update()

  if (model) {
    model.rotation.y += 0.005
  }

  renderer.render(scene, camera)
}

const handleResize = () => {
  const container = modelBox.value
  if (!container || !camera || !renderer) return

  const width = container.clientWidth
  const height = container.clientHeight

  if (!width || !height) return

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  if (model) {
    fitCameraToObject(model)
  }
}

onMounted(() => {
  const container = modelBox.value
  if (!container) return

  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight

  scene = new THREE.Scene()
//   scene.background = new THREE.Color('#cccccc')

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(10, 10, 10)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  scene.add(new THREE.AmbientLight(0xffffff, 1.5))

  const lights = [
    [0, 0, 10, 1],
    [0, 0, -10, 1],
    [10, 0, 0, 1],
    [-10, 0, 0, 1],
    [0, 10, 0, 1],
    [5, 10, 0, 0.3],
    [0, 10, 5, 0.3],
    [0, 10, -5, 0.3],
    [-5, 10, 0, 0.3],
  ]

  lights.forEach(([x, y, z, intensity]) => {
    const light = new THREE.DirectionalLight(0xffffff, intensity)
    light.position.set(x, y, z)
    scene.add(light)
  })

  const loader = new GLTFLoader()
  loader.load(
    '/models/glbfile.glb',
    (gltf) => {
      model = gltf.scene
      scene.add(model)
      fitCameraToObject(model)
      console.log('模型加载成功', gltf)
    },
    undefined,
    (error) => {
      console.error('模型加载失败', error)
    },
  )

  window.addEventListener('resize', handleResize)
  render()
})

onBeforeUnmount(() => {
  const container = modelBox.value

  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationId)
  controls?.dispose()

  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose()

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose?.())
        } else {
          child.material?.dispose?.()
        }
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
.content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
