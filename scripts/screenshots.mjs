// Screenshots of the real desktop app, for the README and for visual QA.
//
//   node scripts/screenshots.mjs [--no-build] [--out=<dir>] [--shots=home,settings] [--langs=en,tr]
//                                [--themes=dark,light] [--scale=1] [--verbose]
//
// Builds the app (unless --no-build), then runs `electron . --screenshots` with the same options: a 1440×900
// window kept off screen, in a throwaway profile, one PNG per shot, language and theme, named
// <out>/<lang>-<theme>-<shot>.png (default out: assets/screenshots). Prints one line per file.
// Shots: onboarding, home, home-scrolled, digest, latest, breaking, category-economy, local, sources,
// settings, settings-typography, search, reader, dialog-web (all by default).
// Unlike `npm run screenshots`, a watchdog kills Electron should it ever hang, and the throwaway profile is
// deleted once Electron has exited. Exit code 0 when every shot was written.
import { spawn, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'electron'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** Longer than the app's own 20-minute limit: this only catches a process that no longer responds. */
const WATCHDOG_MS = 25 * 60_000

const args = process.argv.slice(2)
const out = args.find((arg) => arg.startsWith('--out='))?.slice('--out='.length)
const forwarded = args.filter((arg) => arg !== '--no-build' && !arg.startsWith('--out='))
const modeFlag = out ? `--screenshots=${resolve(process.cwd(), out)}` : '--screenshots'

if (!args.includes('--no-build')) {
  const build = spawnSync(
    process.execPath,
    [resolve(root, 'node_modules/electron-vite/bin/electron-vite.js'), 'build'],
    { cwd: root, stdio: 'inherit' }
  )
  if (build.status !== 0) process.exit(build.status ?? 1)
}

const { code, pid } = await runElectron(['.', modeFlag, ...forwarded])
await removeProfileOf(pid)
process.exit(code)

/** Run the app's Electron with `argv`; resolves with its exit code and pid, killing it after `WATCHDOG_MS`. */
function runElectron(argv) {
  const env = { ...process.env }
  // Set by some tools (and by Electron's own test runners); it would start Electron as plain Node.
  delete env.ELECTRON_RUN_AS_NODE
  const child = spawn(electron, argv, { cwd: root, env, stdio: 'inherit', windowsHide: true })
  const kill = () => {
    if (child.exitCode !== null) return
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else child.kill('SIGKILL')
  }
  const watchdog = setTimeout(() => {
    console.error(`Electron did not finish within ${WATCHDOG_MS / 60_000} minutes; stopping it`)
    kill()
  }, WATCHDOG_MS)
  process.once('SIGINT', kill)
  return new Promise((resolveResult) => {
    child.once('error', (error) => {
      console.error(`Could not start Electron: ${error.message}`)
      resolveResult({ code: 1, pid: child.pid })
    })
    child.once('exit', (exitCode, signal) => {
      clearTimeout(watchdog)
      resolveResult({ code: exitCode ?? (signal ? 1 : 0), pid: child.pid })
    })
  })
}

/**
 * Delete the throwaway profile the app created for process `pid` (src/main/automation/profile.ts names it
 * in `automation.pid`). Chromium's helper processes let go of its files a moment after the app exits.
 */
async function removeProfileOf(pid) {
  const profiles = join(tmpdir(), 'masthead-automation')
  let names
  try {
    names = readdirSync(profiles)
  } catch {
    return
  }
  for (const name of names) {
    const dir = join(profiles, name)
    try {
      if (Number(readFileSync(join(dir, 'automation.pid'), 'utf8')) !== pid) continue
    } catch {
      continue
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        rmSync(dir, { recursive: true, force: true })
        break
      } catch {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 500))
      }
    }
  }
}
