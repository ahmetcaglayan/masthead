import {
  nativeImage,
  screen,
  type BrowserWindow,
  type NativeImage,
  type Rectangle,
  type WebContents
} from 'electron'
import { OFFSCREEN_X } from '../window'

/** Radius of the reader's page view, in DIPs (`BORDER_RADIUS` in reader/view.ts). */
const VIEW_RADIUS = 12
/** Time a window shown off-screen gets to paint before it is captured again. */
const SHOW_SETTLE_MS = 800
/** Space kept between the shown window and the leftmost display. */
const OFFSCREEN_GAP = 100
/** Below this frame rate the page counts as throttled (a hidden window may get ~1 fps). */
const MIN_FPS = 20
const FPS_SAMPLE_MS = 300

export interface ViewLayer {
  contents: WebContents
  /** The view's bounds in window DIPs. */
  bounds: Rectangle
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** The pixel scale an image was captured at (its first representation). */
const scaleOf = (image: NativeImage): number => image.getScaleFactors()[0] ?? 1

/** True for a missing capture: no pixels, or all of them transparent (nothing painted). */
function isBlank(image: NativeImage): boolean {
  if (image.isEmpty()) return true
  const scale = scaleOf(image)
  const { width, height } = image.getSize(scale)
  if (width === 0 || height === 0) return true
  const bitmap = image.toBitmap({ scaleFactor: scale })
  for (let i = 3; i < bitmap.length; i += 4 * 97) if (bitmap[i] !== 0) return false
  return true
}

/**
 * The main window of an automation run, and its captures. The window starts
 * hidden. It is shown instead — inactive, without a taskbar button, left of
 * every display — the first time hidden is not good enough: when Chromium
 * throttles the hidden page (animations and transitions then stall mid-way, so
 * captures and timings are wrong), when a hidden capture comes back empty, or
 * when a child view (the reader's page) is captured, which needs a shown window
 * ("Current display surface not available"). Once shown it stays shown.
 */
export class WindowCapturer {
  private shown = false

  constructor(
    private readonly win: BrowserWindow,
    private readonly warn: (message: string) => void,
    private readonly info: (message: string) => void = () => undefined
  ) {}

  /** True once the window has been shown off-screen. */
  get offscreen(): boolean {
    return this.shown
  }

  /**
   * Make sure the page renders at a real frame rate: count its animation frames
   * for a moment and show the window off-screen when the hidden page is throttled.
   * Resolves with the frames per second measured last.
   */
  async ensureAnimating(): Promise<number> {
    let fps = await this.frameRate()
    if (fps < MIN_FPS && !this.shown) {
      this.info(`The hidden window renders at ${fps} fps; showing it off-screen instead`)
      await this.showOffscreen()
      fps = await this.frameRate()
    }
    if (fps < MIN_FPS) this.warn(`The page renders at only ${fps} fps; animations may be captured mid-way`)
    return fps
  }

  /** The window's page, with the reader's page view (a separate WebContents) composited in when given. */
  async capture(view?: ViewLayer): Promise<NativeImage> {
    let image = await this.capturePage(this.win.webContents)
    if (!image && !this.shown) {
      this.info('The hidden window captured empty; showing it off-screen instead')
      await this.showOffscreen()
      image = await this.capturePage(this.win.webContents)
    }
    if (!image) throw new Error('capturePage() returned an empty image')
    if (!view || view.bounds.width <= 0 || view.bounds.height <= 0) return image
    let layer = await this.capturePage(view.contents)
    if (!layer && !this.shown) {
      await this.showOffscreen()
      image = (await this.capturePage(this.win.webContents)) ?? image
      layer = await this.capturePage(view.contents)
    }
    if (!layer) {
      this.warn('The reader page view captured empty; the dialog is saved without it')
      return image
    }
    return composite(image, layer, view.bounds)
  }

  /** Show without activating, left of every display, and let it paint. */
  async showOffscreen(): Promise<void> {
    if (this.shown || this.win.isDestroyed()) return
    this.shown = true
    const [width, height] = this.win.getContentSize()
    const { width: outerWidth } = this.win.getBounds()
    const left = Math.min(...screen.getAllDisplays().map((display) => display.bounds.x))
    const x = Math.min(OFFSCREEN_X, left - outerWidth - OFFSCREEN_GAP)
    this.win.showInactive()
    this.win.setBounds({ x, y: 0 })
    this.win.setContentSize(width, height)
    await sleep(SHOW_SETTLE_MS)
  }

  /** Animation frames the page draws per second (measured over `FPS_SAMPLE_MS`). */
  private async frameRate(): Promise<number> {
    const script = `new Promise((resolve) => {
      let frames = 0
      let done = false
      const tick = () => {
        if (done) return
        frames++
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      setTimeout(() => {
        done = true
        resolve(frames)
      }, ${FPS_SAMPLE_MS})
    })`
    try {
      const frames = (await this.win.webContents.executeJavaScript(script)) as number
      return Math.round((frames * 1000) / FPS_SAMPLE_MS)
    } catch {
      return 0
    }
  }

  /** A capture of `contents`, or null when it failed or came back blank. */
  private async capturePage(contents: WebContents): Promise<NativeImage | null> {
    try {
      const image = await contents.capturePage()
      return isBlank(image) ? null : image
    } catch {
      return null
    }
  }
}

/**
 * Draw `layer` into `page` at `bounds` (DIPs), clipped to the view's rounded
 * corners with anti-aliased edges, the way the compositor shows it.
 */
export function composite(page: NativeImage, layer: NativeImage, bounds: Rectangle): NativeImage {
  const scale = scaleOf(page)
  const size = page.getSize(scale)
  const pixels = Buffer.from(page.toBitmap({ scaleFactor: scale }))

  const target = {
    x: Math.round(bounds.x * scale),
    y: Math.round(bounds.y * scale),
    width: Math.round(bounds.width * scale),
    height: Math.round(bounds.height * scale)
  }
  const layerScale = scaleOf(layer)
  const layerSize = layer.getSize(layerScale)
  const fitted =
    layerSize.width === target.width && layerSize.height === target.height
      ? layer.toBitmap({ scaleFactor: layerScale })
      : layer
          .resize({ width: target.width, height: target.height, quality: 'best' })
          .toBitmap({ scaleFactor: 1 })

  const radius = VIEW_RADIUS * scale
  const rowBytes = size.width * 4
  const layerRowBytes = target.width * 4
  for (let row = 0; row < target.height; row++) {
    const y = target.y + row
    if (y < 0 || y >= size.height) continue
    const from = Math.max(0, -target.x)
    const to = Math.min(target.width, size.width - target.x)
    if (to <= from) break
    const inCornerRows = row < radius || row >= target.height - radius
    if (!inCornerRows) {
      fitted.copy(
        pixels,
        y * rowBytes + (target.x + from) * 4,
        row * layerRowBytes + from * 4,
        row * layerRowBytes + to * 4
      )
      continue
    }
    for (let col = from; col < to; col++) {
      const cover = coverage(col, row, target.width, target.height, radius)
      if (cover === 0) continue
      const out = y * rowBytes + (target.x + col) * 4
      const src = row * layerRowBytes + col * 4
      for (let channel = 0; channel < 4; channel++) {
        pixels[out + channel] = Math.round(
          fitted[src + channel] * cover + pixels[out + channel] * (1 - cover)
        )
      }
    }
  }
  return nativeImage.createFromBitmap(pixels, { width: size.width, height: size.height, scaleFactor: scale })
}

/** How much of pixel (x, y) lies inside a w×h rectangle with corners of radius r. */
function coverage(x: number, y: number, w: number, h: number, r: number): number {
  const cx = x + 0.5
  const cy = y + 0.5
  const dx = cx < r ? r - cx : cx > w - r ? cx - (w - r) : 0
  const dy = cy < r ? r - cy : cy > h - r ? cy - (h - r) : 0
  if (dx === 0 || dy === 0) return 1
  return Math.min(1, Math.max(0, r - Math.hypot(dx, dy) + 0.5))
}
