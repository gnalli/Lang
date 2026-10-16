"use client"

import * as React from "react"
import * as THREE from "three"

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uFrom;
  uniform float uTo;
  uniform float uMix;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseStrength;

  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  attribute vec3 aStart;
  attribute vec3 aRand;
  attribute float aSeed;

  varying float vAlpha;
  varying float vAccent;

  vec3 shapeAt(float i) {
    if (i < 0.5) return position;
    if (i < 1.5) return aShape1;
    if (i < 2.5) return aShape2;
    return aShape3;
  }

  void main() {
    float m = clamp((uMix - aSeed * 0.35) / 0.65, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vec3 target = mix(shapeAt(uFrom), shapeAt(uTo), m);
    target += aRand * sin(m * 3.14159) * 0.55;
    target += aRand * 0.025 * sin(uTime * 1.4 + aSeed * 6.2831);

    float intro = clamp((uIntro - aSeed * 0.4) / 0.6, 0.0, 1.0);
    intro = 1.0 - pow(1.0 - intro, 3.0);
    vec3 pos = mix(aStart, target, intro);

    vec4 world = modelMatrix * vec4(pos, 1.0);

    vec2 d = world.xy - uMouse;
    float push = smoothstep(0.6, 0.0, length(d)) * uMouseStrength;
    world.xy += normalize(d + vec2(1e-5)) * push * 0.32;
    world.z += push * 0.4;

    float s = uScatter;
    world.x += aRand.x * s * 1.4;
    world.y -= s * s * (1.2 + aSeed * 2.8);
    world.z += aRand.z * s;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed * 0.85) / -mv.z;

    vAccent = step(0.74, fract(aSeed * 13.7)) * (0.6 + 0.4 * sin(m * 3.14159 + uTime * 0.5));
    float depth = clamp((-mv.z - 4.7) / 2.6, 0.0, 1.0);
    vAlpha = (0.35 + 0.65 * fract(aSeed * 7.31)) * intro * (1.0 - s) * mix(1.0, 0.18, depth);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vAccent;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, r);
    vec3 color = mix(uColorA, uColorB, vAccent);
    gl_FragColor = vec4(color, soft * vAlpha * uOpacity);
  }
`

const CAMERA_Z = 6
const CAMERA_FOV = 35
const OBJECT_SIZE = 2.7
const SHAPE_COUNT = 4
const HOLD_SECONDS = 4.2
const MORPH_SECONDS = 2.4

type Layout = {
  mobile: boolean
  count: number
  /** 每个形状各自的 x 偏移，换形时插值，保证右缘始终贴着内容区右边 */
  offsetX: number[]
  offsetY: number
  scale: number
}

/** 横向排版边界，单位是相对粒子画布左侧的 px */
type Bounds = { contentLeft: number; contentRight: number; textRight: number }

const SPHERE_SAMPLES = 48

/** 半径 rho、中心在 ox 的球，透视投影到 z=0 平面后的最右 x。近处的点会被放大，不能只算 ox + rho。 */
function projectedRight(ox: number, rho: number) {
  let max = -Infinity
  for (let i = 0; i <= SPHERE_SAMPLES; i++) {
    const phi = (i / SPHERE_SAMPLES) * Math.PI
    const z = rho * Math.cos(phi)
    const x = (ox + rho * Math.sin(phi)) * (CAMERA_Z / (CAMERA_Z - z))
    if (x > max) max = x
  }
  return max
}

function solve(lo: number, hi: number, f: (v: number) => number, target: number) {
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function getLayout(
  width: number,
  height: number,
  bounds: Bounds | null,
  radii: number[],
  centers: number[],
): Layout {
  const visibleH = 2 * CAMERA_Z * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
  const visibleW = visibleH * (width / Math.max(height, 1))
  if (width < 640) {
    // 顶栏大约 4rem。底部留给文案和滚动提示，粒子只占中间这段。
    const headerPx = 64
    const reservePx = Math.min(360, Math.max(272, height * 0.38))
    const top = (headerPx + 12) / Math.max(height, 1)
    const bottom = 1 - reservePx / Math.max(height, 1)
    const band = Math.max(0.18, bottom - top)
    const scale = Math.min(visibleW * 0.72, visibleH * band * 0.92) / OBJECT_SIZE
    const offsetY = (0.5 - (top + band / 2)) * visibleH
    return {
      mobile: true,
      count: 8000,
      offsetX: centers.map((center) => -center * scale),
      offsetY,
      scale,
    }
  }
  const worldPerPx = visibleW / Math.max(width, 1)
  const contentLeft = bounds?.contentLeft ?? width * 0.05
  const contentRight = bounds?.contentRight ?? width * 0.95
  const textRight = bounds?.textRight ?? contentLeft + width * 0.35
  const contentW = Math.max(contentRight - contentLeft, 1)
  const diameterPx = Math.min(
    contentW * 0.42,
    height * 0.6,
    Math.max(contentRight - textRight - 48, contentW * 0.34),
  )
  const maxR = Math.max(...radii, 1e-3)
  const rho = solve(0, CAMERA_Z * 0.9, (r) => projectedRight(0, r), (diameterPx * worldPerPx) / 2)
  const scale = Math.min(1.1, rho / maxR)
  const right = (contentRight - width / 2) * worldPerPx
  const offsetX = radii.map((r) =>
    solve(-visibleW, visibleW, (ox) => projectedRight(ox, r * scale), right),
  )
  return { mobile: false, count: 15000, offsetX, offsetY: 0, scale }
}

const BASE_PITCH = 0.18

/**
 * 绕竖轴自转时决定横向宽度的半径：先按默认俯仰转一下，再取水平面上的距离。
 * 每个形状 99.5% 的点都落在这个半径里，个别离群点不参与对齐。
 */
function shapeCenterX(points: Float32Array) {
  let sum = 0
  const count = points.length / 3
  for (let i = 0; i < count; i++) sum += points[i * 3] ?? 0
  return count ? sum / count : 0
}

function shapeRadius(points: Float32Array) {
  const lengths = new Float32Array(points.length / 3)
  const cos = Math.cos(BASE_PITCH)
  const sin = Math.sin(BASE_PITCH)
  for (let i = 0; i < lengths.length; i++) {
    const x = points[i * 3]
    const y = points[i * 3 + 1]
    const z = points[i * 3 + 2]
    lengths[i] = Math.hypot(x, y * sin + z * cos)
  }
  lengths.sort()
  return lengths[Math.min(lengths.length - 1, Math.floor(lengths.length * 0.995))] ?? 1
}

/** 确定性随机，保证每次重建形状一致 */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildGeometry(count: number) {
  const rand = mulberry32(20261009)
  const sphere = new Float32Array(count * 3)
  const knot = new Float32Array(count * 3)
  const galaxy = new Float32Array(count * 3)
  const lorenz = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const jitter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  const golden = Math.PI * (3 - Math.sqrt(5))
  const tilt = 0.95
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  // 洛伦兹吸引子：先积分出轨迹，再按步长取点
  let lx = 0.1
  let ly = 0
  let lz = 0
  const step = 0.006
  const advance = () => {
    const dx = 10 * (ly - lx)
    const dy = lx * (28 - lz) - ly
    const dz = lx * ly - (8 / 3) * lz
    lx += dx * step
    ly += dy * step
    lz += dz * step
  }
  for (let i = 0; i < 600; i++) advance()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const y = 1 - (i / (count - 1)) * 2
    const ring = Math.sqrt(1 - y * y)
    const theta = golden * i
    const r = 1.15 + (rand() - 0.5) * 0.05
    sphere[i3] = Math.cos(theta) * ring * r
    sphere[i3 + 1] = y * r
    sphere[i3 + 2] = Math.sin(theta) * ring * r

    const t = rand() * Math.PI * 2
    const kr = Math.cos(3 * t) + 2
    const tube = 0.11 * Math.sqrt(rand())
    const ta = rand() * Math.PI * 2
    knot[i3] = kr * Math.cos(2 * t) * 0.42 + Math.cos(ta) * tube
    knot[i3 + 1] = kr * Math.sin(2 * t) * 0.42 + Math.sin(ta) * tube
    knot[i3 + 2] = -Math.sin(3 * t) * 0.42 + (rand() - 0.5) * tube * 2

    const arm = Math.floor(rand() * 3)
    const gr = Math.pow(rand(), 0.75) * 1.45
    const ga = (arm / 3) * Math.PI * 2 + gr * 2.4 + (rand() - 0.5) * 0.5 * (1.6 - gr)
    const spread = 0.08 + (1.45 - gr) * 0.06
    const gx = Math.cos(ga) * gr + (rand() - 0.5) * spread
    const gz = Math.sin(ga) * gr + (rand() - 0.5) * spread
    const gy = (rand() - 0.5) * 0.12 * (1.5 - gr)
    galaxy[i3] = gx
    galaxy[i3 + 1] = gy * cosT - gz * sinT
    galaxy[i3 + 2] = gy * sinT + gz * cosT

    for (let k = 0; k < 3; k++) advance()
    lorenz[i3] = lx / 21 + (rand() - 0.5) * 0.02
    lorenz[i3 + 1] = (lz - 25) / 21 + (rand() - 0.5) * 0.02
    lorenz[i3 + 2] = ly / 21

    const sa = rand() * Math.PI * 2
    const sr = 3 + rand() * 3.5
    start[i3] = Math.cos(sa) * sr
    start[i3 + 1] = Math.sin(sa) * sr * 0.7
    start[i3 + 2] = (rand() - 0.5) * 5

    jitter[i3] = rand() - 0.5
    jitter[i3 + 1] = rand() - 0.5
    jitter[i3 + 2] = rand() - 0.5
    seeds[i] = rand()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(sphere, 3))
  geometry.setAttribute("aShape1", new THREE.BufferAttribute(knot, 3))
  geometry.setAttribute("aShape2", new THREE.BufferAttribute(galaxy, 3))
  geometry.setAttribute("aShape3", new THREE.BufferAttribute(lorenz, 3))
  geometry.setAttribute("aStart", new THREE.BufferAttribute(start, 3))
  geometry.setAttribute("aRand", new THREE.BufferAttribute(jitter, 3))
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
  const shapes = [sphere, knot, galaxy, lorenz]
  const radii = shapes.map(shapeRadius)
  const centers = shapes.map(shapeCenterX)
  return { geometry, radii, centers }
}

/** 把 CSS 变量（可能是 oklch 等）解析成 three 能用的颜色 */
function readCssColor(name: string, probe: CanvasRenderingContext2D) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = raw || "#000"
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return new THREE.Color(r / 255, g / 255, b / 255)
}

export function HeroParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" })
    } catch {
      return
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
    camera.position.set(0, 0, CAMERA_Z)
    const group = new THREE.Group()
    scene.add(group)

    const uniforms = {
      uTime: { value: 0 },
      uIntro: { value: reduceMotion ? 1 : 0 },
      uFrom: { value: 0 },
      uTo: { value: 1 },
      uMix: { value: 0 },
      uScatter: { value: 0 },
      uSize: { value: 20 },
      uPixelRatio: { value: pixelRatio },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseStrength: { value: 0 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uOpacity: { value: 1 },
    }
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    })

    const probeCanvas = document.createElement("canvas")
    probeCanvas.width = probeCanvas.height = 1
    const probe = probeCanvas.getContext("2d", { willReadFrequently: true })

    const applyTheme = () => {
      const dark = document.documentElement.classList.contains("dark")
      if (probe) {
        uniforms.uColorA.value.copy(readCssColor("--foreground", probe))
        uniforms.uColorB.value.copy(readCssColor("--chart-2", probe))
      }
      material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      uniforms.uOpacity.value = dark ? 0.9 : 0.6
      material.needsUpdate = true
    }

    let points: THREE.Points | null = null
    let radii = [1, 1, 1, 1]
    let centers = [0, 0, 0, 0]
    let layout: Layout | null = null
    let visible = true
    let frame = 0

    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const pointerNdc = new THREE.Vector2()
    const hit = new THREE.Vector3()
    const mouseTarget = new THREE.Vector2(99, 99)
    let mouseActive = false
    let tiltX = 0
    let tiltY = 0

    const rebuild = (count: number) => {
      if (points) {
        points.geometry.dispose()
        group.remove(points)
      }
      const built = buildGeometry(count)
      radii = built.radii
      centers = built.centers
      points = new THREE.Points(built.geometry, material)
      group.add(points)
    }

    const readBounds = (): Bounds | null => {
      const hero = container.closest("[data-home-hero]")
      const content = hero?.querySelector<HTMLElement>("[data-hero-content]")
      const text = hero?.querySelector<HTMLElement>("[data-hero-text]")
      if (!content) return null
      const origin = container.getBoundingClientRect().left
      const box = content.getBoundingClientRect()
      const cs = getComputedStyle(content)
      const contentLeft = box.left - origin + (Number.parseFloat(cs.paddingLeft) || 0)
      // 顶栏最右是 size-8 按钮里的 size-4 图标，看得见的右缘比内容区再往里 8px
      const contentRight = box.right - origin - (Number.parseFloat(cs.paddingRight) || 0) - 8
      const textRight = text ? text.getBoundingClientRect().right - origin : contentLeft
      return { contentLeft, contentRight, textRight }
    }

    const morphOffsetX = () => {
      if (!layout) return 0
      const from = layout.offsetX[uniforms.uFrom.value] ?? 0
      const to = layout.offsetX[uniforms.uTo.value] ?? from
      // 粒子按 seed 错开换形，整体大约在 uMix 的中段完成
      const t = Math.min(1, Math.max(0, (uniforms.uMix.value - 0.175) / 0.65))
      return from + (to - from) * t * t * (3 - 2 * t)
    }

    const applyLayout = () => {
      if (!layout) return
      group.position.set(morphOffsetX(), layout.offsetY, 0)
      group.scale.setScalar(layout.scale)
      uniforms.uSize.value = layout.mobile ? 15 : 17
    }

    const renderStatic = () => {
      if (reduceMotion) renderer.render(scene, camera)
    }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const count = w < 640 ? 8000 : 15000
      if (!points || count !== layout?.count) rebuild(count)
      layout = getLayout(w, h, readBounds(), radii, centers)
      applyLayout()
      renderStatic()
    }

    const readScroll = () => {
      const rect = container.getBoundingClientRect()
      return Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)))
    }

    let elapsed = 0
    let spin = 0
    const timer = new THREE.Timer()
    timer.connect(document)
    const tick = (timestamp: number) => {
      frame = requestAnimationFrame(tick)
      timer.update(timestamp)
      const dt = Math.min(timer.getDelta(), 0.05)
      if (!visible || document.hidden) return
      elapsed += dt
      uniforms.uTime.value = elapsed
      uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt * 0.45)

      const morphTime = Math.max(0, elapsed - 2.2)
      const cycle = HOLD_SECONDS + MORPH_SECONDS
      const index = Math.floor(morphTime / cycle)
      const local = morphTime - index * cycle
      uniforms.uFrom.value = index % SHAPE_COUNT
      uniforms.uTo.value = (index + 1) % SHAPE_COUNT
      uniforms.uMix.value = Math.min(1, Math.max(0, (local - HOLD_SECONDS) / MORPH_SECONDS))
      group.position.x = morphOffsetX()

      uniforms.uScatter.value += (readScroll() - uniforms.uScatter.value) * 0.12
      uniforms.uMouse.value.lerp(mouseTarget, 0.12)
      uniforms.uMouseStrength.value += ((mouseActive ? 1 : 0) - uniforms.uMouseStrength.value) * 0.08

      spin += dt * 0.12
      group.rotation.y += (spin + tiltY - group.rotation.y) * 0.08
      group.rotation.x += (BASE_PITCH + tiltX - group.rotation.x) * 0.05

      renderer.render(scene, camera)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const rect = container.getBoundingClientRect()
      pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointerNdc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        mouseTarget.set(hit.x, hit.y)
        mouseActive = true
      }
      tiltY = pointerNdc.x * 0.35
      tiltX = -pointerNdc.y * 0.15
    }
    const onPointerLeave = () => {
      mouseActive = false
      tiltX = 0
      tiltY = 0
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })
    intersection.observe(container)
    const themeObserver = new MutationObserver(() => {
      applyTheme()
      renderStatic()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    applyTheme()
    group.rotation.x = BASE_PITCH
    resize()

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      document.documentElement.addEventListener("pointerleave", onPointerLeave)
      frame = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(frame)
      timer.dispose()
      resizeObserver.disconnect()
      intersection.disconnect()
      themeObserver.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", onPointerLeave)
      points?.geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduceMotion])

  return <div ref={containerRef} className="absolute inset-0" aria-hidden />
}
