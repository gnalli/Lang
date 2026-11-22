"use client"

import * as React from "react"
import * as THREE from "three"

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseStrength;

  attribute vec3 aRand;
  attribute float aSeed;

  varying float vAlpha;
  varying float vAccent;

  float windAt(float t) {
    float gust = sin(t * 1.04) + 0.53 * sin(t * 1.73 + 1.6) + 0.28 * sin(t * 0.43);
    return smoothstep(-0.8, 1.45, gust);
  }

  void main() {
    vec3 pos = position;
    float radius = length(pos.xy);
    float moving = smoothstep(0.0, 1.0, uTime);
    vec2 windDir = vec2(0.98, 0.20);
    float arrival = uTime - 0.5 * dot(pos.xy, windDir) - 0.28 * radius;
    float pressure = moving * windAt(arrival);
    float flex = smoothstep(0.18, 0.98, radius);
    // Bend across the petal; grains on the same blade travel together.
    vec2 tangent = vec2(-pos.y, pos.x) / max(radius, 0.001);
    pos.xy += tangent * dot(windDir, tangent) * flex * pressure * 0.085;
    pos.z -= pressure * flex * 0.10;

    // Rock around the stem below the bloom, with a slower response than the tips.
    float lean = moving * (0.064 * windAt(uTime - 0.35) + 0.028 * windAt(uTime - 0.85));
    vec2 pivot = vec2(0.0, -0.78);
    pos.xy = pivot + mat2(cos(lean), -sin(lean), sin(lean), cos(lean)) * (pos.xy - pivot);
    float intro = smoothstep(0.0, 0.75, uIntro - aSeed * 0.24);
    pos += aRand * (1.0 - intro) * 0.14;

    vec4 world = modelMatrix * vec4(pos, 1.0);

    vec2 d = world.xy - uMouse;
    float push = (1.0 - smoothstep(0.0, 0.42, length(d))) * uMouseStrength;
    world.xy += normalize(d + vec2(1e-5)) * push * 0.085;
    world.z += push * 0.4;

    float s = uScatter;
    world.x += aRand.x * s * 1.4;
    world.y -= s * s * (1.2 + aSeed * 2.8);
    world.z += aRand.z * s;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed * 0.85) / -mv.z;

    vAccent = mix(0.96, 0.04, smoothstep(0.06, 0.92, radius));
    float depth = smoothstep(-0.25, 0.44, world.z);
    vAlpha = mix(0.42, 0.96, depth) * (0.62 + 0.38 * aSeed) * intro * (1.0 - s);
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
    float soft = 1.0 - smoothstep(0.05, 0.5, r);
    vec3 color = mix(uColorA, uColorB, vAccent);
    gl_FragColor = vec4(color, soft * vAlpha * uOpacity);
  }
`

const CAMERA_Z = 6
const VIEW_HEIGHT = 4

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
  const surface = new Float32Array(count * 3)
  const jitter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  // Outer ray florets unfurl; each smaller whorl cups more tightly around the centre.
  const petals = [26, 22, 18, 15, 12].flatMap((petalCount, layer) =>
    Array.from({ length: petalCount }, (_, index) => ({
      layer,
      angle: ((index + rand() * 0.28) / petalCount) * Math.PI * 2 + layer * 0.93,
      length: (1 - layer * 0.18) * (0.89 + rand() * 0.11),
      curl: rand() * 0.42 - 0.16,
    })),
  )

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const petal = petals[i % petals.length]
    const t = Math.sqrt(rand())
    const root = 0.04 + (4 - petal.layer) * 0.054
    const radius = root + (petal.length - root) * t
    const angle = petal.angle + petal.curl * t * t + 0.085 * Math.sin(t * Math.PI)
    // A little more pollen along the folded edges keeps neighbouring petals distinct.
    const cross = Math.cos(rand() * Math.PI)
    const halfWidth = (0.059 - petal.layer * 0.008) * Math.pow(Math.sin(Math.PI * t), 0.55)
    const across = cross * halfWidth
    surface[i3] = radius * Math.cos(angle) - across * Math.sin(angle)
    surface[i3 + 1] = radius * Math.sin(angle) + across * Math.cos(angle)
    surface[i3 + 2] = petal.layer * 0.072 + Math.sin(Math.PI * t) * 0.18
      + (0.035 * petal.layer - 0.12) * t * t + cross * cross * halfWidth
    jitter[i3] = rand() - 0.5
    jitter[i3 + 1] = rand() - 0.5
    jitter[i3 + 2] = rand() - 0.5
    seeds[i] = rand()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(surface, 3))
  geometry.setAttribute("aRand", new THREE.BufferAttribute(jitter, 3))
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1))
  return geometry
}

/** 把 CSS 变量（可能是 oklch 等）解析成 three 能用的颜色 */
function readCssColor(raw: string, probe: CanvasRenderingContext2D) {
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
    const camera = new THREE.OrthographicCamera(-1, 1, VIEW_HEIGHT / 2, -VIEW_HEIGHT / 2, 0.1, 50)
    camera.position.set(0, 0, CAMERA_Z)
    const group = new THREE.Group()
    scene.add(group)

    const uniforms = {
      uTime: { value: 0 },
      uIntro: { value: reduceMotion ? 1 : 0 },
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
        uniforms.uColorA.value.copy(readCssColor(getComputedStyle(container).getPropertyValue("--hero-petal").trim(), probe))
        uniforms.uColorB.value.copy(readCssColor(getComputedStyle(container).color, probe))
      }
      uniforms.uOpacity.value = dark ? 0.9 : 0.6
      material.needsUpdate = true
    }

    let points: THREE.Points | null = null
    const hero = container.closest("[data-home-hero]")
    const content = hero?.querySelector<HTMLElement>("[data-hero-content]")
    const text = hero?.querySelector<HTMLElement>("[data-hero-text]")
    let visible = false
    let frame = 0

    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const pointerNdc = new THREE.Vector2()
    const hit = new THREE.Vector3()
    const mouseTarget = new THREE.Vector2(99, 99)
    let mouseActive = false
    const renderStatic = () => {
      if (reduceMotion) renderer.render(scene, camera)
    }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      const unit = VIEW_HEIGHT / h
      camera.right = w * unit / 2
      camera.left = -camera.right
      camera.updateProjectionMatrix()
      if (!content || !text) return

      const mobile = w < 640
      const count = mobile ? 9500 : 22000
      if (points?.geometry.getAttribute("position").count !== count) {
        if (points) {
          points.geometry.dispose()
          group.remove(points)
        }
        points = new THREE.Points(buildGeometry(count), material)
        points.frustumCulled = false
        group.add(points)
      }

      const origin = container.getBoundingClientRect()
      const box = content.getBoundingClientRect()
      const style = getComputedStyle(content)
      const copy = text.getBoundingClientRect()
      const top = copy.top - origin.top
      const left = box.left - origin.left + parseFloat(style.paddingLeft)
      const right = box.right - origin.left - parseFloat(style.paddingRight)
      const roomLeft = copy.right - origin.left + 28
      const diameter = mobile
        ? Math.max(0, Math.min(w * 0.62, 240, top - parseFloat(style.paddingTop) - 52))
        : Math.max(0, Math.min(460, h * 0.65, right - roomLeft))
      const radius = diameter / 2
      const centerX = mobile
        ? w / 2
        : THREE.MathUtils.clamp(left + (right - left) * 0.75, roomLeft + radius, right - radius)
      const centerY = mobile ? top - 36 - radius : top + copy.height / 2
      group.position.set((centerX - w / 2) * unit, (h / 2 - centerY) * unit, 0)
      group.scale.setScalar(radius * unit)
      group.rotation.set(0.32, -0.18, -0.15)
      uniforms.uSize.value = mobile ? 14 : 17 * Math.max(1, diameter / 380)
      renderStatic()
    }

    const readScroll = () => {
      const rect = container.getBoundingClientRect()
      return Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)))
    }

    let elapsed = 0
    const timer = new THREE.Timer()
    timer.connect(document)
    const tick = (timestamp: number) => {
      frame = 0
      if (!visible || document.hidden) return
      frame = requestAnimationFrame(tick)
      timer.update(timestamp)
      const dt = Math.min(timer.getDelta(), 0.05)
      elapsed += dt
      uniforms.uTime.value = elapsed
      uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt * 0.45)

      uniforms.uScatter.value += (readScroll() - uniforms.uScatter.value) * 0.12
      uniforms.uMouse.value.lerp(mouseTarget, 0.12)
      uniforms.uMouseStrength.value += ((mouseActive ? 1 : 0) - uniforms.uMouseStrength.value) * 0.08

      renderer.render(scene, camera)
    }

    const syncAnimation = () => {
      if (reduceMotion) return
      if (visible && !document.hidden) {
        if (!frame) {
          timer.reset()
          frame = requestAnimationFrame(tick)
        }
      } else {
        cancelAnimationFrame(frame)
        frame = 0
        mouseActive = false
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!visible || document.hidden || event.pointerType !== "mouse") return
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
    }
    const onPointerLeave = () => {
      mouseActive = false
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    if (text) resizeObserver.observe(text)
    document.fonts.addEventListener("loadingdone", resize)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      syncAnimation()
    })
    intersection.observe(container)
    const themeObserver = new MutationObserver(() => {
      applyTheme()
      renderStatic()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    applyTheme()
    resize()

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      document.documentElement.addEventListener("pointerleave", onPointerLeave)
      document.addEventListener("visibilitychange", syncAnimation)
    }

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", syncAnimation)
      timer.dispose()
      resizeObserver.disconnect()
      document.fonts.removeEventListener("loadingdone", resize)
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

  return <div ref={containerRef} className="absolute inset-0 text-(color:--hero-pollen)" aria-hidden />
}
