// Renders assets/logo.svg into every icon the app and installers need:
//   build/icon.png (1024), build/icon.ico (16–256), resources/icon.png (512),
//   src/renderer/public/favicon.png (64), assets/logo-{128,256,512}.png and the
//   Microsoft Store package's tiles in build/appx/.
// Usage: npm run icons
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(resolve(root, 'assets/logo.svg'), 'utf8')

function render(size) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: 'rgba(0,0,0,0)' }).render().asPng()
}

/** The logo, `size` px square, centred on a transparent `width`×`height` canvas. */
function renderOn(width, height, size) {
  const logo = `data:image/png;base64,${Buffer.from(render(size)).toString('base64')}`
  const canvas =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<image href="${logo}" x="${(width - size) / 2}" y="${(height - size) / 2}" width="${size}" height="${size}"/></svg>`
  return new Resvg(canvas, { background: 'rgba(0,0,0,0)' }).render().asPng()
}

function write(rel, data) {
  const file = resolve(root, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, data)
  console.log('  wrote', rel)
}

write('build/icon.png', render(1024))
write('resources/icon.png', render(512))
write('src/renderer/public/favicon.png', render(64))
for (const size of [128, 256, 512]) write(`assets/logo-${size}.png`, render(size))

const icoSizes = [16, 24, 32, 48, 64, 128, 256]
write('build/icon.ico', await pngToIco(icoSizes.map(render)))

// Microsoft Store (AppX) tiles, at every scale Windows asks for. The logo is its own tile, so the
// small icons use it edge to edge and unplated; the larger tiles show it at two thirds of their height.
const scales = [100, 125, 150, 200, 400]
for (const scale of scales) {
  const at = (px) => Math.round((px * scale) / 100)
  write(`build/appx/StoreLogo.scale-${scale}.png`, render(at(50)))
  write(`build/appx/Square44x44Logo.scale-${scale}.png`, render(at(44)))
  write(`build/appx/Square150x150Logo.scale-${scale}.png`, renderOn(at(150), at(150), at(100)))
  write(`build/appx/Wide310x150Logo.scale-${scale}.png`, renderOn(at(310), at(150), at(100)))
}
for (const size of [16, 24, 32, 48, 256]) {
  write(`build/appx/Square44x44Logo.targetsize-${size}.png`, render(size))
  write(`build/appx/Square44x44Logo.targetsize-${size}_altform-unplated.png`, render(size))
}
