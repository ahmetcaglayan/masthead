// Renders assets/logo.svg into every icon the app and installers need:
//   build/icon.png (1024), build/icon.ico (16–256), resources/icon.png (512),
//   src/renderer/public/favicon.png (64) and assets/logo-{128,256,512}.png.
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
