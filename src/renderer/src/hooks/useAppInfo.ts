import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import { api } from '@/lib/api'

let info: AppInfo | null = null
let pending: Promise<AppInfo> | null = null

/** Host, platform and version info; null for the first render until the host answers (cached after). */
export function useAppInfo(): AppInfo | null {
  const [value, setValue] = useState<AppInfo | null>(info)
  useEffect(() => {
    if (info) return
    let alive = true
    pending ??= api.app.info().then((result) => (info = result))
    void pending.then((result) => alive && setValue(result))
    return () => {
      alive = false
    }
  }, [])
  return value
}
