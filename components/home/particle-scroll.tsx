"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

/**
 * 视口某条线以下的内容化成沙，向上滚动时逐粒还原。
 * 着色器思路参考 canvas-ui 的 ParticleScroll；那版依赖实验性的 HTML-in-Canvas API，
 * 这里改为自行把子树（文字、背景、边框、图片）栅格化成纹理，基于 window 滚动，WebGL2 即可运行。
 * 已还原的行显示真实 DOM（可交互），未还原的行由 mask 隐去、交给粒子。
 * 输出画布是内容的兄弟节点，absolute 定位并随文档滚动，每帧挪到视口上方 overscan 处。
 * 不能用 fixed：合成器滚动快于主线程绘制，fixed 画布上的沙会落后于 DOM 和遮罩。
 */

type Options = {
  /** 成形线在视口中的位置（0–1） */
  point: number
  /** 从散开到成形的过渡带高度（px） */
  band: number
  /** 沙粒间距（px） */
  density: number
  /** 散开时沙粒尺寸（px） */
  size: number
  /** 散开的最大距离（px） */
  spread: number
  /** 散开云团的下坠倾向（-1–1） */
  gravity: number
  /** 散开时的漂浮速度 */
  drift: number
  /** 归位时的侧向弧线（px） */
  swirl: number
  /** 每粒归位时机的随机度（0–1） */
  stagger: number
  /** 完全散开时的不透明度 */
  fade: number
  /** 一行沙从散开到成形的秒数 */
  settle: number
  /** 平滑滚动追赶的时间常数（秒） */
  smoothing: number
}

const DEFAULTS: Options = {
  point: 0.7,
  band: 380,
  density: 2,
  size: 1.25,
  spread: 200,
  gravity: 0.35,
  drift: 0.7,
  swirl: 60,
  stagger: 0.7,
  fade: 0.85,
  settle: 1.1,
  smoothing: 0.5,
}

const HASH = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}`

const POINT_VERT = `#version 300 es
precision highp float;
uniform sampler2D uRowTex;
uniform sampler2D uContent;
uniform vec2 uRes;
uniform vec2 uContentSize;
uniform vec2 uOrigin;
uniform vec2 uGrid;
uniform float uWinStart;
uniform float uMaskRow;
uniform float uDensity;
uniform float uStagger;
uniform float uSpread;
uniform float uGravity;
uniform float uDrift;
uniform float uSwirl;
uniform float uTime;
uniform float uFade;
uniform float uSize;
uniform float uDpr;
uniform float uLag;
out vec2 vCenter;
out float vSize;
out float vAlpha;
out float vLod;
out float vMerge;
${HASH}
void hide() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  vCenter = vec2(0.0);
  vSize = 0.0;
  vAlpha = 0.0;
  vLod = 0.0;
  vMerge = 0.0;
}
void main() {
  float fid = float(gl_VertexID);
  vec2 local = vec2(mod(fid, uGrid.x), floor(fid / uGrid.x));
  vec2 cell = vec2(local.x, local.y + uWinStart);
  vec2 home = (cell + 0.5) * uDensity;
  if (cell.y < uMaskRow || home.x > uContentSize.x || home.y > uContentSize.y) {
    hide();
    return;
  }
  float h1 = hash(cell);
  float h2 = hash(cell + vec2(1.7, 9.1));
  float h3 = hash(cell + vec2(5.5, 2.9));
  float h4 = hash(cell + vec2(8.4, 4.2));
  float d = h1 * uStagger;
  float p = texelFetch(uRowTex, ivec2(int(local.y), 0), 0).r;
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0);

  // 卡片底是大块纯色，和区块底对比才看得见。散开距离若和文字一样，
  // 相邻卡片会糊成一片，沙也会沉到卡片外面。纯色只在原位轻轻散开；
  // 文字和边缘仍用完整 spread。归位时把抽掉的底色沙补回来，再交给 DOM。
  vec2 uv = clamp(home / uContentSize, 0.0, 1.0);
  vec4 here = textureLod(uContent, uv, 0.0);
  if (here.a < 0.04) {
    hide();
    return;
  }
  vec2 texel = 2.5 / uContentSize;
  float diff = 0.0;
  diff = max(diff, distance(here, textureLod(uContent, clamp(uv + vec2(texel.x, 0.0), 0.0, 1.0), 0.0)));
  diff = max(diff, distance(here, textureLod(uContent, clamp(uv - vec2(texel.x, 0.0), 0.0, 1.0), 0.0)));
  diff = max(diff, distance(here, textureLod(uContent, clamp(uv + vec2(0.0, texel.y), 0.0, 1.0), 0.0)));
  diff = max(diff, distance(here, textureLod(uContent, clamp(uv - vec2(0.0, texel.y), 0.0, 1.0), 0.0)));
  float edge = smoothstep(0.05, 0.2, diff);
  if (edge < 0.35 && h1 < mix(0.34, 0.0, smoothstep(0.45, 0.9, t))) {
    hide();
    return;
  }
  float spreadScale = mix(0.14, 1.0, smoothstep(0.12, 0.5, edge));

  vec2 screenHome = home + uOrigin;
  vec2 dir = normalize(vec2(h2 - 0.5, h3 - 0.5) + vec2(1e-4, 0.0));
  float reach = 0.08 + 0.92 * pow(h4, 2.4);
  vec2 off = dir * uSpread * reach * spreadScale;
  off.y += uGravity * uSpread * (0.25 + 0.75 * h4) * spreadScale;
  vec2 pos = mix(screenHome + off, screenHome, e);
  vec2 perp = vec2(-dir.y, dir.x);
  pos += perp * (h2 - 0.5) * 2.0 * uSwirl * sin(e * 3.14159) * spreadScale;
  float tt = uTime * uDrift;
  float amp = (1.0 - e) * (uSpread * 0.05 * spreadScale + mix(0.8, 2.5, spreadScale));
  pos += vec2(
    sin(tt * (4.0 + 5.0 * h2) + h3 * 40.0),
    cos(tt * (3.5 + 5.5 * h3) + h2 * 40.0)
  ) * amp;
  // 只拖文字和边缘。底色沙跟着滚动下坠，会在成形线下方拉出一条露底的空带。
  pos.y += uLag * (1.0 - e) * (0.5 + 0.5 * h4) * max(spreadScale - 0.14, 0.0) / 0.86;
  pos += vec2(h4 - 0.5, h1 - 0.5) * uDensity * 3.0 * (1.0 - smoothstep(0.5, 0.85, t));

  float grow = smoothstep(0.55, 1.0, e);
  float sizeCss = mix(uSize, uDensity * 1.3, grow);
  vCenter = home;
  vSize = sizeCss;
  vAlpha = mix(uFade, 1.0, e);
  vLod = (1.0 - e) * 1.5;
  vMerge = smoothstep(0.75, 0.97, t);
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = max(sizeCss * uDpr, 1.0);
}`

const POINT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform vec2 uContentSize;
in vec2 vCenter;
in float vSize;
in float vAlpha;
in float vLod;
in float vMerge;
out vec4 outColor;
void main() {
  vec2 o = gl_PointCoord - 0.5;
  vec2 uv = clamp((vCenter + o * vSize) / uContentSize, 0.0, 1.0);
  vec4 tex = textureLod(uContent, uv, vLod);
  float circle = 1.0 - smoothstep(0.25, 0.5, length(o));
  float a = vAlpha * mix(circle, 1.0, vMerge);
  if (tex.a * a < 0.01) discard;
  outColor = tex * a;
}`

function isTransparent(color: string) {
  return (
    color === "transparent" ||
    color === "rgba(0, 0, 0, 0)" ||
    /\/\s*0\)$/.test(color) ||
    /,\s*0\)$/.test(color)
  )
}

type CornerRadii = [number, number, number, number]

function cornerRadii(cs: CSSStyleDeclaration): CornerRadii {
  const n = (value: string) => {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }
  return [
    n(cs.borderTopLeftRadius),
    n(cs.borderTopRightRadius),
    n(cs.borderBottomRightRadius),
    n(cs.borderBottomLeftRadius),
  ]
}

function insetRadii(radii: CornerRadii, top: number, right: number, bottom: number, left: number): CornerRadii {
  return [
    Math.max(0, radii[0] - Math.max(top, left)),
    Math.max(0, radii[1] - Math.max(top, right)),
    Math.max(0, radii[2] - Math.max(bottom, right)),
    Math.max(0, radii[3] - Math.max(bottom, left)),
  ]
}

function trace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
) {
  ctx.beginPath()
  if (radii.every((radius) => radius === 0) || typeof ctx.roundRect !== "function") ctx.rect(x, y, w, h)
  else ctx.roundRect(x, y, w, h, radii)
}

/** 把子树的背景、边框、图片与文字画进 canvas，作为沙粒的颜色来源 */
function rasterize(root: HTMLElement, scale: number) {
  const base = root.getBoundingClientRect()
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.ceil(base.width * scale))
  canvas.height = Math.max(1, Math.ceil(base.height * scale))
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.scale(scale, scale)
  ctx.textBaseline = "middle"
  const range = document.createRange()

  const paintText = (node: Text, cs: CSSStyleDeclaration) => {
    const text = node.data
    if (!text.trim() || isTransparent(cs.color)) return
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    ctx.fillStyle = cs.color
    let i = 0
    for (const ch of text) {
      const len = ch.length
      if (ch.trim()) {
        range.setStart(node, i)
        range.setEnd(node, i + len)
        const r = range.getClientRects()[0]
        if (r && r.width > 0) {
          ctx.fillText(ch, r.left - base.left, r.top - base.top + r.height / 2)
        }
      }
      i += len
    }
  }

  const paintSvg = (svg: SVGSVGElement, opacity: number) => {
    const cs = getComputedStyle(svg)
    if (cs.display === "none" || cs.visibility === "hidden") return
    const alpha = opacity * Number.parseFloat(cs.opacity || "1")
    if (alpha < 0.03) return
    const rect = svg.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const box = svg.viewBox.baseVal
    const boxW = box?.width || Number(svg.getAttribute("width")) || rect.width
    const boxH = box?.height || Number(svg.getAttribute("height")) || rect.height
    if (!boxW || !boxH) return

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(rect.left - base.left, rect.top - base.top)
    ctx.scale(rect.width / boxW, rect.height / boxH)
    const widthAttr = svg.getAttribute("stroke-width")
    const lineWidth = widthAttr ? Number.parseFloat(widthAttr) : 2
    ctx.lineWidth = Number.isFinite(lineWidth) ? lineWidth : 2
    ctx.lineCap = cs.strokeLinecap === "butt" || cs.strokeLinecap === "square" ? cs.strokeLinecap : "round"
    ctx.lineJoin = cs.strokeLinejoin === "miter" || cs.strokeLinejoin === "bevel" ? cs.strokeLinejoin : "round"
    const color = cs.color

    for (const node of svg.querySelectorAll("path, line, circle, rect, polyline, polygon")) {
      if (!(node instanceof SVGElement)) continue
      let path: Path2D | null = null
      if (node instanceof SVGPathElement) {
        const d = node.getAttribute("d")
        if (d) path = new Path2D(d)
      } else if (node instanceof SVGLineElement) {
        path = new Path2D()
        path.moveTo(node.x1.baseVal.value, node.y1.baseVal.value)
        path.lineTo(node.x2.baseVal.value, node.y2.baseVal.value)
      } else if (node instanceof SVGCircleElement) {
        path = new Path2D()
        path.arc(node.cx.baseVal.value, node.cy.baseVal.value, node.r.baseVal.value, 0, Math.PI * 2)
      } else if (node instanceof SVGRectElement) {
        path = new Path2D()
        path.rect(node.x.baseVal.value, node.y.baseVal.value, node.width.baseVal.value, node.height.baseVal.value)
      } else if (node instanceof SVGPolylineElement || node instanceof SVGPolygonElement) {
        const points = node.points
        if (points.length > 0) {
          path = new Path2D()
          path.moveTo(points.getItem(0).x, points.getItem(0).y)
          for (let i = 1; i < points.length; i++) path.lineTo(points.getItem(i).x, points.getItem(i).y)
          if (node instanceof SVGPolygonElement) path.closePath()
        }
      }
      if (!path) continue
      const fill = node.getAttribute("fill") ?? svg.getAttribute("fill")
      const stroke = node.getAttribute("stroke") ?? svg.getAttribute("stroke")
      if (fill && fill !== "none") {
        ctx.fillStyle = fill === "currentColor" ? color : fill
        ctx.fill(path)
      }
      if (stroke && stroke !== "none") {
        ctx.strokeStyle = stroke === "currentColor" ? color : stroke
        ctx.stroke(path)
      }
    }
    ctx.restore()
  }

  const paintImage = (img: HTMLImageElement, opacity: number) => {
    if (!img.complete || img.naturalWidth < 1 || img.naturalHeight < 1) return
    const cs = getComputedStyle(img)
    if (cs.display === "none" || cs.visibility === "hidden") return
    const alpha = opacity * Number.parseFloat(cs.opacity || "1")
    if (alpha < 0.03) return
    const rect = img.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    let dw = rect.width
    let dh = rect.height
    const fit = cs.objectFit
    if (fit === "cover") {
      const scale = Math.max(rect.width / nw, rect.height / nh)
      dw = nw * scale
      dh = nh * scale
    } else if (fit === "contain" || fit === "scale-down") {
      const scale = Math.min(rect.width / nw, rect.height / nh, fit === "scale-down" ? 1 : Infinity)
      dw = nw * scale
      dh = nh * scale
    } else if (fit === "none") {
      dw = nw
      dh = nh
    }
    const [ox, oy] = cs.objectPosition.split(/\s+/)
    const axis = (token: string | undefined, space: number) => {
      if (!token || token === "center") return space / 2
      if (token === "left" || token === "top") return 0
      if (token === "right" || token === "bottom") return space
      if (token.endsWith("%")) return (space * Number.parseFloat(token)) / 100
      return space / 2
    }
    const x = rect.left - base.left + axis(ox, rect.width - dw)
    const y = rect.top - base.top + axis(oy, rect.height - dh)
    ctx.save()
    ctx.globalAlpha = alpha
    try {
      ctx.drawImage(img, x, y, dw, dh)
    } catch {
      // 跨域图片会弄脏画布，沙里就只留卡片底色。
    }
    ctx.restore()
  }

  const visit = (el: Element, opacity: number) => {
    if (el instanceof SVGSVGElement) {
      paintSvg(el, opacity)
      return
    }
    if (el instanceof SVGElement || el instanceof HTMLScriptElement) return
    if (el instanceof HTMLImageElement) {
      paintImage(el, opacity)
      return
    }
    const cs = getComputedStyle(el)
    if (cs.display === "none") return
    const alpha = opacity * Number.parseFloat(cs.opacity || "1")
    if (alpha < 0.03) return
    const r = el.getBoundingClientRect()
    const x = r.left - base.left
    const y = r.top - base.top
    ctx.globalAlpha = alpha

    const radii = cornerRadii(cs)
    const top = Number.parseFloat(cs.borderTopWidth) || 0
    const right = Number.parseFloat(cs.borderRightWidth) || 0
    const bottom = Number.parseFloat(cs.borderBottomWidth) || 0
    const left = Number.parseFloat(cs.borderLeftWidth) || 0
    const borderStyles = [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle]
    const borderColors = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor]
    const borderWidths = [top, right, bottom, left]
    const borderVisible = borderWidths.map(
      (width, index) => width > 0 && borderStyles[index] !== "none" && !isTransparent(borderColors[index]),
    )
    const rounded = radii.some((radius) => radius > 0) && typeof ctx.roundRect === "function"
    const uniformBorder =
      rounded &&
      borderVisible.every(Boolean) &&
      borderStyles.every((style) => style === "solid") &&
      borderColors.every((color) => color === borderColors[0]) &&
      borderWidths.every((width) => width === borderWidths[0])

    if (cs.visibility !== "hidden" && r.width > 0 && r.height > 0) {
      if (!isTransparent(cs.backgroundColor)) {
        ctx.fillStyle = cs.backgroundColor
        trace(ctx, x, y, r.width, r.height, radii)
        ctx.fill()
      }
      if (uniformBorder) {
        const innerW = r.width - left - right
        const innerH = r.height - top - bottom
        ctx.fillStyle = borderColors[0]
        ctx.beginPath()
        ctx.roundRect(x, y, r.width, r.height, radii)
        if (innerW > 0 && innerH > 0) {
          ctx.roundRect(x + left, y + top, innerW, innerH, insetRadii(radii, top, right, bottom, left))
        }
        ctx.fill("evenodd")
      } else {
        const sides = [
          [cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor, x, y, r.width, 0],
          [cs.borderBottomWidth, cs.borderBottomStyle, cs.borderBottomColor, x, y + r.height, r.width, 0],
          [cs.borderLeftWidth, cs.borderLeftStyle, cs.borderLeftColor, x, y, 0, r.height],
          [cs.borderRightWidth, cs.borderRightStyle, cs.borderRightColor, x + r.width, y, 0, r.height],
        ] as const
        for (const [width, style, color, sx, sy, sw, sh] of sides) {
          const bw = Number.parseFloat(width)
          if (!bw || style === "none" || isTransparent(color)) continue
          ctx.fillStyle = color
          if (sw) ctx.fillRect(sx, sy === y ? sy : sy - bw, sw, bw)
          else ctx.fillRect(sx === x ? sx : sx - bw, sy, bw, sh)
        }
      }
    }

    const clip = cs.overflowX !== "visible" || cs.overflowY !== "visible"
    if (clip) {
      ctx.save()
      const innerW = r.width - left - right
      const innerH = r.height - top - bottom
      if (innerW > 0 && innerH > 0) {
        trace(ctx, x + left, y + top, innerW, innerH, insetRadii(radii, top, right, bottom, left))
      } else {
        trace(ctx, x, y, r.width, r.height, radii)
      }
      ctx.clip()
    }
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (cs.visibility !== "hidden") {
          ctx.globalAlpha = alpha
          paintText(child as Text, cs)
        }
      } else if (child instanceof Element) {
        visit(child, alpha)
      }
    }
    if (clip) ctx.restore()
  }

  for (const child of root.children) visit(child, 1)
  return canvas
}

function createEngine(content: HTMLElement, output: HTMLCanvasElement, config: Options) {
  const gl = output.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
  })
  if (!gl) return null

  const compile = (type: number, text: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, text)
    gl.compileShader(shader)
    return shader
  }
  const vert = compile(gl.VERTEX_SHADER, POINT_VERT)
  const frag = compile(gl.FRAGMENT_SHADER, POINT_FRAG)
  const program = gl.createProgram()!
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "ParticleScroll shader:",
      gl.getProgramInfoLog(program),
      gl.getShaderInfoLog(vert),
      gl.getShaderInfoLog(frag),
    )
    gl.deleteProgram(program)
    gl.deleteShader(vert)
    gl.deleteShader(frag)
    return null
  }
  const u: Record<string, WebGLUniformLocation | null> = {}
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < uniformCount; i++) {
    const info = gl.getActiveUniform(program, i)!
    u[info.name] = gl.getUniformLocation(program, info.name)
  }
  const vao = gl.createVertexArray()

  const contentTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, contentTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const rowTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, rowTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number

  let snapshotReady = false
  let contentW = 1
  let contentH = 1
  let rowProgress = new Float32Array(0)
  let rowWindow = new Float32Array(0)
  let maskY = -1
  let time = 0
  let lag = 0
  let lastScroll = window.scrollY
  let scrollSmooth = window.scrollY
  let lastTime = performance.now()
  let raf = 0
  let running = false
  let destroyed = false
  let near = true

  const setMask = (y: number | null) => {
    const next = y === null ? -1 : Math.round(y)
    if (next === maskY) return
    maskY = next
    const value =
      y === null
        ? ""
        : `linear-gradient(to bottom, #000 ${next}px, transparent ${next + config.density * 6}px)`
    content.style.maskImage = value
    content.style.setProperty("-webkit-mask-image", value)
    // 卡片用这个偏移判断底边是否已经过了成形线（含页尾把线往下推的情况）
    if (y === null) content.setAttribute("data-particle-reveal", "full")
    else content.setAttribute("data-particle-reveal", String(next))
    content.dispatchEvent(new Event("particlescroll"))
  }

  let settleUntil = 0
  let forceSnapshot = false
  let themeCaptureFailed = false
  const layoutLocked = () => content.matches(":hover") || performance.now() < settleUntil

  const clearOutput = () => {
    gl.viewport(0, 0, Math.max(output.width, 1), Math.max(output.height, 1))
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  const snapshot = (immediate = false) => {
    if (destroyed) return
    // 悬停和收起那几百毫秒里行高会变。这段时间重拍会把悬停底色拍进沙，也会卡主线程。
    // 换主题必须立刻拍，不能被这把锁挡住，否则线以下还是上一套卡片底色。
    if (!immediate && layoutLocked()) {
      if (forceSnapshot) scheduleSnapshot(400)
      return
    }
    const rect = content.getBoundingClientRect()
    const nextW = Math.max(1, rect.width)
    const nextH = Math.max(1, rect.height)
    const sameSize = snapshotReady && Math.abs(nextW - contentW) < 1 && Math.abs(nextH - contentH) < 1
    if (!immediate && sameSize && !forceSnapshot) return
    forceSnapshot = false
    contentW = nextW
    contentH = nextH
    const scale = Math.min(
      Math.min(window.devicePixelRatio || 1, 2),
      maxTexture / contentW,
      maxTexture / contentH,
      Math.sqrt(16_777_216 / (contentW * contentH)),
    )
    const canvas = rasterize(content, scale)
    if (!canvas || destroyed) {
      if (!immediate || destroyed) return
      // 旧纹理不能再画。遮罩先拿掉，让新主题的卡片自己露出来，再试一次。
      snapshotReady = false
      setMask(null)
      clearOutput()
      if (!themeCaptureFailed) {
        themeCaptureFailed = true
        clearTimeout(snapshotTimer)
        snapshotTimer = setTimeout(() => snapshot(true), 0)
      }
      return
    }
    themeCaptureFailed = false
    gl.bindTexture(gl.TEXTURE_2D, contentTex)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.generateMipmap(gl.TEXTURE_2D)
    snapshotReady = true
    // 换主题不能等下一帧的 rAF。class 已经变了，浏览器会先画新卡片，再跑 rAF，中间一帧就是旧沙。
    if (immediate) render(0)
    start()
    for (const img of content.querySelectorAll("img")) {
      if (img.complete && img.naturalWidth > 0) continue
      if (img.dataset.particleWait === "1") continue
      img.dataset.particleWait = "1"
      img.addEventListener(
        "load",
        () => {
          delete img.dataset.particleWait
          forceSnapshot = true
          scheduleSnapshot(32)
        },
        { once: true },
      )
    }
  }

  // 画布跟着文档滚动，不是 fixed。fixed 的画布由主线程按旧的 scrollY 绘制，
  // 合成器先把 DOM 和遮罩滚上去，快速滚动时沙会落后一截，中间露出区块底色。
  // 上下各多画 overscan，合成器先滚的那几帧也有沙。
  let viewW = 1
  let viewH = 1
  let overscan = 0
  const syncCanvasSize = () => {
    viewW = Math.max(1, document.documentElement.clientWidth)
    viewH = Math.max(1, window.innerHeight)
    overscan = Math.round(viewH * 0.3)
    const cssH = viewH + overscan * 2
    output.style.width = `${viewW}px`
    output.style.height = `${cssH}px`
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(viewW * dpr))
    const h = Math.max(1, Math.round(cssH * dpr))
    if (output.width !== w || output.height !== h) {
      output.width = w
      output.height = h
    }
  }
  let placed = ""
  const placeCanvas = (wrapLeft: number, wrapTop: number) => {
    const next = `translate3d(${-wrapLeft}px, ${-wrapTop - overscan}px, 0)`
    if (next === placed) return
    placed = next
    output.style.transform = next
  }
  // 还没开始画的区块也要先对齐视口左缘，否则画布从内容列左边伸出去，把页面横向撑宽
  const placeNow = () => {
    const wrap = (output.parentElement ?? content).getBoundingClientRect()
    placeCanvas(wrap.left, wrap.top)
  }

  /** 未截断的进度。大于 1 的部分表示这一行已经越过成形线多远（以 band 为单位）。 */
  const rowTarget = (rowViewportY: number, viewportH: number, sectionBottom: number) => {
    const band = Math.max(config.band, 1)
    const base = config.point * viewportH
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    let line = base
    if (maxScroll <= 1) {
      line = viewportH + band
    } else {
      const endP = Math.min(
        Math.max((scrollSmooth - (maxScroll - viewportH * 0.5)) / (viewportH * 0.5), 0),
        1,
      )
      const pageLine = base + (viewportH + band - base) * endP * endP
      // 底边还在视口外时，线停在 70%，沙继续铺在下沿。
      // 底边进入视口之后才往下推，再滚过 tail 的一半才收完，避免一贴底就没了。
      const tail = Math.max(viewportH - base, 1)
      const linger = tail * 0.5
      const sectionP = Math.min(Math.max((viewportH - sectionBottom) / linger, 0), 1)
      const sectionLine =
        sectionBottom <= viewportH - linger + 1
          ? viewportH + band
          : base + (viewportH - base) * sectionP
      line = Math.max(pageLine, sectionLine)
    }
    return Math.max((line + band - rowViewportY) / band, 0)
  }

  const render = (dt: number) => {
    const w = viewW
    const h = viewH
    const rect = content.getBoundingClientRect()
    const wrapRect = (output.parentElement ?? content).getBoundingClientRect()
    placeCanvas(wrapRect.left, wrapRect.top)
    const docTop = rect.top + window.scrollY
    const density = Math.max(config.density, Math.sqrt((w * h) / 800000))
    const docRows = Math.max(1, Math.ceil(contentH / density))
    // 只处理与画布（视口上下各加 overscan，下方再加散开余量）相交的行
    const winStart = Math.min(docRows, Math.max(0, Math.floor((-rect.top - overscan) / density)))
    const winEnd = Math.min(
      docRows,
      Math.ceil((h + overscan - rect.top + config.spread * 0.6) / density) + 2,
    )
    const winLen = Math.max(0, winEnd - winStart)
    const gridX = Math.ceil(contentW / density)

    const sectionBottom = rect.bottom
    const linger = Math.max(h - config.point * h, 1) * 0.5
    const sectionDone = sectionBottom <= h - linger + 1
    if (rowProgress.length !== docRows) {
      rowProgress = new Float32Array(docRows)
      for (let i = 0; i < docRows; i++) {
        rowProgress[i] = Math.min(
          rowTarget(docTop - scrollSmooth + (i + 0.5) * density, h, sectionBottom),
          1,
        )
      }
    }
    if (rowWindow.length < winLen) rowWindow = new Float32Array(winLen + 64)

    let animating = false
    let maskRow = docRows
    const settle = Math.max(config.settle, 0.05)
    for (let i = 0; i < docRows; i++) {
      const raw = rowTarget(docTop - scrollSmooth + (i + 0.5) * density, h, sectionBottom)
      const target = Math.min(raw, 1)
      let p = rowProgress[i]
      const inWin = i >= winStart - 4 && i < winStart + winLen + 4
      if (p !== target) {
        // 收尾滚完才直接成形，下推过程里仍按 settle 逐行归位。
        // 快速滚动时行会冲过成形线还没归位，越过得越远归位越快，免得线上方留一大片沙。
        if (!inWin || sectionDone) p = target
        else if (p < target) p = Math.min(p + (dt / settle) * (1 + Math.max(raw - 1, 0) * 3), target)
        else p = Math.max(p - dt / (settle * 0.6), target)
        if (p !== target) animating = true
        rowProgress[i] = p
      }
      if (p < 0.9995 && i < maskRow) maskRow = i
    }

    if (winLen > 0) rowWindow.set(rowProgress.subarray(winStart, winEnd), 0)

    setMask(maskRow >= docRows ? null : maskRow * density)

    gl.viewport(0, 0, output.width, output.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (maskRow >= docRows || maskRow >= winEnd || winLen === 0) return animating

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, rowTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, winLen, 1, 0, gl.RED, gl.FLOAT, rowWindow.subarray(0, winLen))
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, contentTex)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniform1i(u.uContent, 0)
    gl.uniform1i(u.uRowTex, 1)
    gl.uniform2f(u.uRes, w, h + overscan * 2)
    gl.uniform2f(u.uContentSize, contentW, contentH)
    gl.uniform2f(u.uOrigin, rect.left, rect.top + overscan)
    gl.uniform2f(u.uGrid, gridX, winLen)
    gl.uniform1f(u.uWinStart, winStart)
    gl.uniform1f(u.uMaskRow, maskRow)
    gl.uniform1f(u.uDensity, density)
    gl.uniform1f(u.uStagger, Math.min(Math.max(config.stagger, 0), 0.95))
    gl.uniform1f(u.uSpread, config.spread)
    gl.uniform1f(u.uGravity, config.gravity)
    gl.uniform1f(u.uDrift, config.drift)
    gl.uniform1f(u.uSwirl, config.swirl)
    gl.uniform1f(u.uTime, time)
    gl.uniform1f(u.uFade, config.fade)
    gl.uniform1f(u.uSize, config.size)
    gl.uniform1f(u.uDpr, output.width / w)
    gl.uniform1f(u.uLag, lag)
    gl.drawArrays(gl.POINTS, 0, gridX * winLen)
    gl.disable(gl.BLEND)
    // 散开的沙会一直漂浮，只要还有未成形的行就保持动画
    return true
  }

  const frame = (now: number) => {
    if (destroyed) return
    if (!near || !snapshotReady || document.hidden) {
      running = false
      return
    }
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now
    time += dt
    const scrollY = window.scrollY
    lag += scrollY - lastScroll
    lastScroll = scrollY
    lag *= Math.exp(-dt / 0.22)
    lag = Math.min(Math.max(lag, -400), 400)
    if (Math.abs(lag) < 0.1) lag = 0
    const k = config.smoothing <= 0 ? 1 : 1 - Math.exp(-dt / config.smoothing)
    scrollSmooth += (scrollY - scrollSmooth) * k
    if (Math.abs(scrollY - scrollSmooth) < 0.5) scrollSmooth = scrollY

    const animating = render(dt)
    if (!animating && scrollSmooth === scrollY && lag === 0) {
      running = false
      return
    }
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (destroyed || running || !near || !snapshotReady) return
    running = true
    lastTime = performance.now()
    raf = requestAnimationFrame(frame)
  }

  let snapshotTimer: ReturnType<typeof setTimeout> | undefined
  const scheduleSnapshot = (delay = 160) => {
    clearTimeout(snapshotTimer)
    snapshotTimer = setTimeout(snapshot, delay)
  }
  const onPointerLeave = () => {
    settleUntil = performance.now() + 400
    scheduleSnapshot(400)
  }
  content.addEventListener("pointerleave", onPointerLeave)

  const onScroll = () => start()
  const onVisibility = () => start()
  window.addEventListener("scroll", onScroll, { passive: true })
  document.addEventListener("visibilitychange", onVisibility)

  const resizeObserver = new ResizeObserver(() => {
    syncCanvasSize()
    placeNow()
    if (layoutLocked()) return
    scheduleSnapshot()
  })
  resizeObserver.observe(content)
  const onResize = () => {
    syncCanvasSize()
    placeNow()
    start()
  }
  window.addEventListener("resize", onResize)

  const mutationObserver = new MutationObserver(() => {
    // 悬停时不拍。作品卡会在这段时间里换文字，松手后的那次重拍即使尺寸没变也要补上。
    if (layoutLocked()) {
      forceSnapshot = true
      return
    }
    scheduleSnapshot(400)
  })
  mutationObserver.observe(content, { childList: true, subtree: true, characterData: true })
  const themeObserver = new MutationObserver(() => {
    // 颜色已经换完。同一轮就重拍并画上，不能留着上一套卡片底。
    clearTimeout(snapshotTimer)
    snapshot(true)
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

  const intersection = new IntersectionObserver(
    (entries) => {
      near = entries[entries.length - 1]?.isIntersecting ?? true
      if (near) start()
    },
    { rootMargin: `0px 0px ${config.spread + 200}px 0px` },
  )
  intersection.observe(content)

  syncCanvasSize()
  placeNow()
  document.fonts.ready.then(() => {
    if (!destroyed) snapshot()
  })

  return () => {
    destroyed = true
    cancelAnimationFrame(raf)
    clearTimeout(snapshotTimer)
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onResize)
    document.removeEventListener("visibilitychange", onVisibility)
    content.removeEventListener("pointerleave", onPointerLeave)
    resizeObserver.disconnect()
    mutationObserver.disconnect()
    themeObserver.disconnect()
    intersection.disconnect()
    setMask(null)
    gl.deleteTexture(contentTex)
    gl.deleteTexture(rowTex)
    gl.deleteProgram(program)
    gl.deleteShader(vert)
    gl.deleteShader(frag)
    gl.deleteVertexArray(vao)
  }
}

export function ParticleScroll({
  children,
  className,
  ...options
}: Partial<Options> & { children: React.ReactNode; className?: string }) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const outputRef = React.useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()
  const [config] = React.useState(() => ({ ...DEFAULTS, ...options }))
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const content = contentRef.current
    const output = outputRef.current
    if (!content || !output || reduceMotion || !mounted) return
    return createEngine(content, output, config) ?? undefined
  }, [config, reduceMotion, mounted])

  // 纵向裁到本区块：画布比视口高，不能把页面撑长，沙也不落进相邻区块。横向不裁，沙可以散出内容列。
  return (
    <div className="relative flex flex-1 flex-col overflow-y-clip">
      <div ref={contentRef} data-particle-host="" className={className}>
        {children}
      </div>
      {mounted && !reduceMotion ? (
        <canvas
          ref={outputRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-20 max-w-none"
        />
      ) : null}
    </div>
  )
}
