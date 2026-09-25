import { app } from 'electron'
import type { Logger } from '@core/backend'
import type { UpdateStatus } from '@shared/ipc'
import { detectUpdateMode, UpdateController, type Updater } from './controller'

export { UpdateController } from './controller'

export interface UpdatesOptions {
  /** The "install updates automatically" setting. */
  autoInstall(): boolean
  /** Save everything and close the window before the installer takes over. */
  prepareToQuit(): Promise<void>
  onChange(status: UpdateStatus): void
  logger: Logger
  /** Automation runs never update. */
  disabled?: boolean
}

/**
 * The app's updater: GitHub Releases through electron-updater, which reads the
 * `latest*.yml` files every release publishes and picks the installer for this
 * machine's architecture. Development builds, automation runs and Microsoft Store copies
 * get a controller that never checks.
 */
export async function createUpdates(options: UpdatesOptions): Promise<UpdateController> {
  const mode = options.disabled
    ? 'none'
    : detectUpdateMode(process.env, process.platform, app.isPackaged, process.windowsStore === true)
  let updater: Updater | null = null
  if (mode === 'auto' || mode === 'manual') {
    // electron-updater is CommonJS and defines `autoUpdater` as a lazy getter, which Node
    // does not expose as a named export through import(); the default export (its
    // module.exports) has it.
    const { autoUpdater } = (await import('electron-updater')).default
    const { logger } = options
    autoUpdater.logger = {
      info: (message?: unknown) => logger.info(String(message)),
      warn: (message?: unknown) => logger.warn(String(message)),
      error: (message?: unknown) => logger.error(String(message)),
      debug: () => undefined
    }
    // Same repository as `publish` in electron-builder.yml; set here so a check never
    // depends on the app-update.yml a build may lack (portable, macOS).
    autoUpdater.setFeedURL({ provider: 'github', owner: 'ahmetcaglayan', repo: 'masthead' })
    // "Later" still gets the update: it installs quietly when the app quits.
    autoUpdater.autoInstallOnAppQuit = mode === 'auto'
    autoUpdater.allowPrerelease = false
    updater = autoUpdater
  }
  return new UpdateController({
    mode,
    current: app.getVersion(),
    updater,
    autoInstall: options.autoInstall,
    prepareToQuit: options.prepareToQuit,
    relaunch: () => {
      app.relaunch()
      app.exit(0)
    },
    onChange: options.onChange,
    logger: options.logger
  })
}
