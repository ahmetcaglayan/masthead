// Smoke test of the real desktop app against the live network.
//
//   node scripts/selftest.mjs [--no-build] [--report=<file.json>] [--verbose]
//
// Builds the app (unless --no-build), then runs `electron . --selftest`: a window kept off screen, in a
// throwaway profile, that waits for the first refresh of every feed, times page changes, opens an article in
// the embedded web view (load, Esc to close), extracts one in Reader mode, checks ad blocking and collects
// renderer console errors and uncaught main-process errors. PASS/FAIL lines go to stderr, the JSON report to
// stdout (and to --report). Unlike `npm run selftest`, a watchdog kills Electron should it ever hang, and the
// throwaway profile is deleted once Electron has exited. Exit code 0 only when every check passed.
import { spawn, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'electron'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** Longer than the app's own 6-minute limit: this only catches a process that no longer responds. */
const WATCHDOG_MS = 8 * 60_000

const args = process.argv.slice(2)
const reportFile = args.find((arg) => arg.startsWith('--report='))?.slice('--report='.length)
const forwarded = args.filter((arg) => arg === '--verbose')

if (!args.includes('--no-build')) {
  const build = spawnSync(
    process.execPath,
    [resolve(root, 'node_modules/electron-vite/bin/electron-vite.js'), 'build'],
    { cwd: root, stdio: 'inherit' }
  )
  if (build.status !== 0) process.exit(build.status ?? 1)
}

const { code, pid, stdout } = await runElectron(['.', '--selftest', ...forwarded])
await removeProfileOf(pid)
if (reportFile) {
  const report = stdout.slice(stdout.indexOf('{'), stdout.lastIndexOf('}') + 1)
  if (report) writeFileSync(resolve(process.cwd(), reportFile), report + '\n')
  else console.error('The self-test printed no report')
}
process.exit(code)

/** Run the app's Electron with `argv`, echoing and collecting its stdout; kills it after `WATCHDOG_MS`. */
function runElectron(argv) {
  const env = { ...process.env }
  // Set by some tools (and by Electron's own test runners); it would start Electron as plain Node.
  delete env.ELECTRON_RUN_AS_NODE
  const child = spawn(electron, argv, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'inherit'],
    windowsHide: true
  })
  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    stdout += chunk
    process.stdout.write(chunk)
  })
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
      resolveResult({ code: 1, pid: child.pid, stdout })
    })
    child.once('close', (exitCode, signal) => {
      clearTimeout(watchdog)
      resolveResult({ code: exitCode ?? (signal ? 1 : 0), pid: child.pid, stdout })
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
