import { mkdir, open, readFile, rename, rm } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import type { Logger } from '../backend'

export interface JsonFileOptions {
  /** Quiet period before a `save()` reaches the disk; newer saves replace pending ones. Default 300 ms. */
  debounceMs?: number
  /** Indent the JSON so the file stays readable by people. */
  pretty?: boolean
  logger?: Logger
}

let tmpCounter = 0

/**
 * A JSON document on disk. Loading tolerates missing and corrupt files; saving is
 * debounced and atomic (write a temp file, fsync, rename over the target).
 */
export class JsonFile<T> {
  private readonly debounceMs: number
  private readonly pretty: boolean
  private readonly logger?: Logger
  private pending: { value: T } | undefined
  private timer: ReturnType<typeof setTimeout> | undefined
  private writing: Promise<void> = Promise.resolve()

  constructor(
    readonly path: string,
    options: JsonFileOptions = {}
  ) {
    this.debounceMs = options.debounceMs ?? 300
    this.pretty = options.pretty ?? false
    this.logger = options.logger
  }

  /**
   * Read the file and pass the parsed JSON through `validate`. A missing file yields
   * `fallback`; a file that does not parse or validate (validate throws) is moved aside
   * as `<name>.corrupt-<timestamp>.json` and also yields `fallback`.
   */
  async load(fallback: T, validate: (raw: unknown) => T): Promise<T> {
    let text: string
    try {
      text = await readFile(this.path, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
        this.logger?.warn(`Cannot read ${this.path}`, error)
      return fallback
    }
    try {
      return validate(JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text))
    } catch (error) {
      const backup = join(
        dirname(this.path),
        `${basename(this.path, extname(this.path))}.corrupt-${Date.now()}${extname(this.path) || '.json'}`
      )
      this.logger?.warn(`${this.path} is corrupt, moving it to ${backup}`, error)
      await rename(this.path, backup).catch((renameError: unknown) =>
        this.logger?.error(`Cannot back up ${this.path}`, renameError)
      )
      return fallback
    }
  }

  /** Schedule `value` to be written after the debounce window. */
  save(value: T): void {
    this.pending = { value }
    clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.flush(), this.debounceMs)
  }

  /** Write any pending value now and wait until everything scheduled so far is on disk. */
  async flush(): Promise<void> {
    clearTimeout(this.timer)
    this.timer = undefined
    const pending = this.pending
    this.pending = undefined
    if (pending) this.writing = this.writing.then(() => this.write(pending.value))
    await this.writing
  }

  private async write(value: T): Promise<void> {
    const tmp = `${this.path}.${process.pid}-${++tmpCounter}.tmp`
    try {
      const json = JSON.stringify(value, null, this.pretty ? 2 : undefined)
      await mkdir(dirname(this.path), { recursive: true })
      const handle = await open(tmp, 'w')
      try {
        await handle.writeFile(`${json}\n`, 'utf8')
        await handle.sync()
      } finally {
        await handle.close()
      }
      await renameWithRetry(tmp, this.path)
    } catch (error) {
      this.logger?.error(`Cannot write ${this.path}`, error)
      await rm(tmp, { force: true }).catch(() => undefined)
    }
  }
}

/** Windows can briefly refuse a rename while a scanner or indexer holds the target open. */
async function renameWithRetry(from: string, to: string, attempts = 5): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await rename(from, to)
      return
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (attempt >= attempts || (code !== 'EPERM' && code !== 'EACCES' && code !== 'EBUSY')) throw error
      await new Promise((resolve) => setTimeout(resolve, 20 * 2 ** attempt))
    }
  }
}
