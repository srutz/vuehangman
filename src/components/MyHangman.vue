<template>
  <div ref="host"
    class="relative w-full max-w-md aspect-[5/5.4] overflow-hidden rounded-2xl border border-zinc-600 shadow-2xl shadow-black/60"
    role="img" :aria-label="`Galgenmännchen: ${wrongGuesses} von ${MAX_MISSES} Fehlversuchen`"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const MAX_MISSES = 6

const props = defineProps<{
  /** Number of wrong guesses so far (0–6). */
  misses: number
}>()

const wrongGuesses = computed(() => Math.min(Math.max(props.misses, 0), MAX_MISSES))
const lost = computed(() => wrongGuesses.value >= MAX_MISSES)

const host = ref<HTMLDivElement>()

// ---- scene state shared with the watcher -------------------------------
let setMisses: ((n: number, animate: boolean) => void) | null = null
let dispose: (() => void) | null = null

watch(wrongGuesses, (n) => setMisses?.(n, true))

onMounted(() => {
  if (!host.value) return
  dispose = createScene(host.value)
})
onBeforeUnmount(() => dispose?.())

function createScene(container: HTMLElement) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---------------------------------------------------------------- renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const fogColor = new THREE.Color(0x0b0d1a)
  scene.background = fogColor
  scene.fog = new THREE.FogExp2(0x0b0d1a, 0.045)

  const camera = new THREE.PerspectiveCamera(40, 5 / 6, 0.1, 100)
  const camBase = new THREE.Vector3(1.2, 3.1, 11)
  camera.position.copy(camBase)
  const lookAt = new THREE.Vector3(0.6, 3.4, 0)

  // ---------------------------------------------------------------- lights
  scene.add(new THREE.HemisphereLight(0x6677aa, 0x1a1208, 0.55))

  const moon = new THREE.DirectionalLight(0x9fb4ff, 2.2)
  moon.position.set(-6, 10, 6)
  moon.castShadow = true
  moon.shadow.mapSize.set(1024, 1024)
  Object.assign(moon.shadow.camera, { left: -7, right: 7, top: 9, bottom: -3, near: 1, far: 30 })
  moon.shadow.bias = -0.0005
  scene.add(moon)

  const lantern = new THREE.PointLight(0xff9a3c, 12, 12, 1.6)
  lantern.position.set(-1.6, 1.4, 1.6)
  lantern.castShadow = true
  lantern.shadow.mapSize.set(512, 512)
  scene.add(lantern)

  // overhead fill light so the top of the gallows isn't lost in the dark
  const topLight = new THREE.PointLight(0xdbe6ff, 45, 24, 1.5)
  topLight.position.set(1.2, 10, 4)
  scene.add(topLight)

  const flash = new THREE.PointLight(0xaec8ff, 0, 60, 1)
  flash.position.set(0, 9, 4)
  scene.add(flash)

  // ---------------------------------------------------------------- ground
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ color: 0x1b1a22, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // procedural wood texture
  const woodTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    g.fillStyle = '#a8794a'
    g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 140; i++) {
      const y = Math.random() * 256
      g.strokeStyle = `rgba(${60 + Math.random() * 40},${35 + Math.random() * 25},15,${0.1 + Math.random() * 0.2})`
      g.lineWidth = 0.5 + Math.random() * 2.5
      g.beginPath()
      g.moveTo(0, y)
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 3)
      g.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  })()
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85, emissive: 0x3a2412, emissiveMap: woodTex, emissiveIntensity: 0.5, bumpMap: woodTex, bumpScale: 0.6 })
  const iron = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.8, roughness: 0.4 })

  function addBox(w: number, h: number, d: number, x: number, y: number, z: number, rz = 0, mat = wood) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.rotation.z = rz
    m.castShadow = m.receiveShadow = true
    scene.add(m)
    return m
  }

  // ---------------------------------------------------------------- gallows
  // platform (steps)
  addBox(5.2, 0.35, 2.6, 0.8, 0.175, 0)
  addBox(4.4, 0.35, 2.0, 0.8, 0.52, 0)
  // post, beam, brace
  addBox(0.38, 6.2, 0.38, -1.0, 3.6, 0)
  const beamY = 6.5
  addBox(3.6, 0.34, 0.38, 0.7, beamY, 0)
  const brace = addBox(1.7, 0.2, 0.22, -0.1, beamY - 0.8, 0, Math.PI / 4)
  brace.scale.x = 1
  // iron bands + nails
  for (const y of [1.3, 3.4, 5.4]) addBox(0.44, 0.1, 0.44, -1.0, y, 0, 0, iron)
  addBox(0.4, 0.4, 0.44, -1.0, beamY, 0, 0, iron)

  // trapdoor with a lever
  addBox(1.4, 0.06, 1.0, 1.7, 0.72, 0.4, 0, new THREE.MeshStandardMaterial({ color: 0x2c1a0b, roughness: 1 }))

  // ---------------------------------------------------------------- lantern prop

  // ---------------------------------------------------------------- rope + victim
  const pivot = new THREE.Group() // swing pivot at the beam
  const pivotPos = new THREE.Vector3(2.0, beamY - 0.17, 0)
  pivot.position.copy(pivotPos)
  scene.add(pivot)

  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc9a56a, roughness: 1 })
  const ropeLen = 1.2
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, ropeLen, 8), ropeMat)
  rope.position.y = -ropeLen / 2
  rope.castShadow = true
  pivot.add(rope)

  // noose (always visible)
  const noose = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 24), ropeMat)
  noose.position.y = -ropeLen - 0.15
  noose.rotation.x = Math.PI / 2 - 0.2
  noose.castShadow = true
  pivot.add(noose)

  const skin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0x555555 })
  const cloth = new THREE.MeshStandardMaterial({ color: 0xd6e8ff, roughness: 0.9, emissive: 0x555555 })
  const pants = new THREE.MeshStandardMaterial({ color: 0xfff1d0, roughness: 0.9, emissive: 0x555555 })
  const bodyMats = [skin, cloth, pants]

  const headY = -ropeLen - 0.55
  const parts: THREE.Object3D[] = []

  const makePart = (obj: THREE.Object3D, origin: THREE.Vector3) => {
    // wrap in a group positioned at "origin" so scaling grows from there
    const g = new THREE.Group()
    g.position.copy(origin)
    obj.position.sub(origin)
    g.add(obj)
    obj.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true
    })
    g.scale.setScalar(0.0001)
    g.visible = false
    pivot.add(g)
    parts.push(g)
    return g
  }

  const limb = (r: number, len: number, mat: THREE.Material, from: THREE.Vector3, to: THREE.Vector3) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat)
    const mid = from.clone().add(to).multiplyScalar(0.5)
    m.position.copy(mid)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
    return m
  }

  // 1 head
  const head = new THREE.Group()
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 24), skin)
  head.add(skull)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 })
  const eyes: THREE.Mesh[] = []
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyeMat)
    e.position.set(s * 0.14, 0.05, 0.36)
    head.add(e)
    eyes.push(e)
  }
  head.position.set(0, headY, 0)
  makePart(head, new THREE.Vector3(0, headY, 0))

  // 2 torso
  const shoulderY = headY - 0.55
  const hipY = shoulderY - 1.1
  makePart(
    limb(0.3, 0.85, cloth, new THREE.Vector3(0, shoulderY, 0), new THREE.Vector3(0, hipY, 0)),
    new THREE.Vector3(0, shoulderY, 0),
  )
  // 3,4 arms
  const armTop = new THREE.Vector3(0, shoulderY - 0.1, 0)
  makePart(
    limb(0.11, 0.7, cloth, new THREE.Vector3(-0.3, armTop.y, 0), new THREE.Vector3(-0.85, armTop.y - 0.9, 0.05)),
    new THREE.Vector3(-0.3, armTop.y, 0),
  )
  makePart(
    limb(0.11, 0.7, cloth, new THREE.Vector3(0.3, armTop.y, 0), new THREE.Vector3(0.85, armTop.y - 0.9, 0.05)),
    new THREE.Vector3(0.3, armTop.y, 0),
  )
  // 5,6 legs
  makePart(
    limb(0.14, 0.85, pants, new THREE.Vector3(-0.15, hipY, 0), new THREE.Vector3(-0.3, hipY - 1.25, 0)),
    new THREE.Vector3(-0.15, hipY, 0),
  )
  makePart(
    limb(0.14, 0.85, pants, new THREE.Vector3(0.15, hipY, 0), new THREE.Vector3(0.3, hipY - 1.25, 0)),
    new THREE.Vector3(0.15, hipY, 0),
  )

  // ---------------------------------------------------------------- stars
  const starGeo = new THREE.BufferGeometry()
  const starPos = new Float32Array(600 * 3)
  for (let i = 0; i < 600; i++) {
    const r = 40 + Math.random() * 10
    const th = Math.random() * Math.PI * 2
    const ph = Math.random() * Math.PI * 0.45
    starPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 2, -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 5], i * 3)
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, fog: false, sizeAttenuation: true }))
  scene.add(stars)

  // ---------------------------------------------------------------- ground mist
  const mistTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    gr.addColorStop(0, 'rgba(180,190,230,0.5)')
    gr.addColorStop(1, 'rgba(180,190,230,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  })()
  const mist: THREE.Sprite[] = []
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: mistTex, transparent: true, opacity: 0.22, depthWrite: false }),
    )
    s.scale.setScalar(4 + Math.random() * 3)
    s.position.set((Math.random() - 0.5) * 12, 0.5 + Math.random() * 0.6, (Math.random() - 0.2) * 5)
    s.userData.s = Math.random() * 10
    scene.add(s)
    mist.push(s)
  }

  // ---------------------------------------------------------------- reveal animation state
  // reveal[i]: 0 hidden → 1 fully shown (eased with overshoot)
  const reveal = parts.map(() => ({ t: 1, start: 0, active: false }))
  let shown = 0
  let loseTime = -1
  let kick = 0 // swing impulse
  let flashT = 0

  const easeOutBack = (x: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
  }

  setMisses = (n, animate) => {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!
      const want = i < n
      const was = i < shown
      if (want && !was) {
        p.visible = true
        if (animate && !reduceMotion) {
          reveal[i] = { t: 0, start: performance.now(), active: true }
          kick += 0.35
          flashT = 0.35
        } else {
          p.scale.setScalar(1)
          reveal[i] = { t: 1, start: 0, active: false }
        }
      } else if (!want && was) {
        p.visible = false
        p.scale.setScalar(0.0001)
      }
    }
    shown = n
    const isLost = n >= MAX_MISSES
    if (isLost && loseTime < 0) {
      loseTime = performance.now()
      kick += 0.9
      flashT = 1
    } else if (!isLost) {
      loseTime = -1
    }
    for (const m of bodyMats) m.emissive.set(0x555555)
  }
  setMisses(wrongGuesses.value, false)

  // ---------------------------------------------------------------- interaction (parallax)
  const pointer = new THREE.Vector2()
  const onMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
  }
  container.addEventListener('pointermove', onMove)
  container.addEventListener('pointerleave', () => pointer.set(0, 0))
  const onClick = () => {
    kick += 0.5 // poke the rope
  }
  container.addEventListener('click', onClick)

  // ---------------------------------------------------------------- resize
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  // ---------------------------------------------------------------- loop
  const clock = new THREE.Clock()
  let swingAngle = 0
  let swingVel = 0
  let raf = 0
  const introStart = performance.now()
  const INTRO_MS = 350
  const INTRO_DIST = 22
  const redTint = new THREE.Color(0xff1a1a)

  const tick = () => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    const now = performance.now()

    // reveal animations
    reveal.forEach((r, i) => {
      if (!r.active) return
      const p = parts[i]!
      const k = Math.min((now - r.start) / 700, 1)
      const s = Math.max(easeOutBack(k), 0.0001)
      p.scale.setScalar(s)
      p.position.y += 0 // scale only
      if (k >= 1) r.active = false
    })

    // spring-damper swing (pendulum); more misses → wilder wind
    swingVel += kick * 2.2
    kick = 0
    const wind = reduceMotion ? 0 : Math.sin(t * 0.7) * 0.012 * (1 + shown * 0.5)
    const acc = -14 * swingAngle - 0.9 * swingVel + wind * 20
    swingVel += acc * dt
    swingAngle += swingVel * dt
    pivot.rotation.z = swingAngle
    pivot.rotation.x = Math.sin(t * 0.9) * 0.02 * Math.min(shown, 3)
    // slow twist of the body
    pivot.rotation.y = Math.sin(t * 0.55) * 0.35 * (shown > 0 ? 1 : 0.2)

    // lost: pulsing red glow on victim + eyes become X-ish (go dark red)
    if (lost.value) {
      const pulse = 0.35 + Math.sin(t * 5) * 0.25
      for (const m of bodyMats) {
        m.emissive.copy(redTint).multiplyScalar(pulse)
      }
      lantern.color.lerp(new THREE.Color(0xff2a1a), 0.05)
      // oxlint-disable-next-line no-self-assign
      scene.fog = scene.fog as THREE.FogExp2
        ; (scene.fog as THREE.FogExp2).color.lerp(new THREE.Color(0x2a0505), 0.02)
      fogColor.lerp(new THREE.Color(0x2a0505), 0.02)
      for (const e of eyes) e.scale.setScalar(1.4)
    } else {
      lantern.color.lerp(new THREE.Color(0xff9a3c), 0.05)
        ; (scene.fog as THREE.FogExp2).color.lerp(new THREE.Color(0x0b0d1a), 0.04)
      fogColor.lerp(new THREE.Color(0x0b0d1a), 0.04)
      for (const e of eyes) e.scale.setScalar(1)
      for (const m of bodyMats) m.emissive.set(0x555555)
    }

    // lightning on each miss
    flashT = Math.max(0, flashT - dt * 2.2)
    flash.intensity = flashT > 0 ? (Math.random() > 0.35 ? flashT * 900 : flashT * 200) : 0

    // mist drift
    for (const s of mist) {
      s.position.x += Math.sin(t * 0.2 + s.userData.s) * dt * 0.15
    }

    stars.rotation.y = t * 0.004

    // camera: gentle orbit + pointer parallax
    const orbit = reduceMotion ? 0 : Math.sin(t * 0.18) * 0.9
    camera.position.x += (camBase.x + orbit + pointer.x * 1.6 - camera.position.x) * 0.05
    camera.position.y += (camBase.y - pointer.y * 0.8 - camera.position.y) * 0.05
    const k = reduceMotion ? 1 : Math.min((now - introStart) / INTRO_MS, 1)
    const intro = 1 - Math.pow(1 - k, 3) // easeOutCubic
    camera.position.z = camBase.z + INTRO_DIST * (1 - intro)
    camera.lookAt(lookAt)

    renderer.render(scene, camera)
  }
  tick()

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    container.removeEventListener('pointermove', onMove)
    container.removeEventListener('click', onClick)
    setMisses = null
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose()
        const m = o.material as THREE.Material | THREE.Material[]
          ; (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
      }
    })
    woodTex.dispose()
    mistTex.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
</script>
