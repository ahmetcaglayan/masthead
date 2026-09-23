import { useEffect, useRef } from 'react'
import { isTypingTarget, matchHotkey } from '@/lib/hotkeys'

export interface HotkeyBinding {
  /** One combo or alternatives, e.g. `'Mod+K'` or `['Mod+R', 'F5']`. See lib/hotkeys.ts. */
  combo: string | readonly string[]
  handler: (event: KeyboardEvent) => void
  /** Also fire while the user is typing in an input/textarea/contenteditable. Default false. */
  allowInInputs?: boolean
  /** Call `preventDefault()` when matched. Default true. */
  preventDefault?: boolean
  /** Temporarily switch the binding off. Default true. */
  enabled?: boolean
}

/**
 * Global keyboard shortcuts on `window`. Bindings are read from a ref, so
 * passing a fresh array every render is fine and never re-subscribes.
 * Keystrokes inside text fields are ignored unless a binding opts in.
 */
export function useHotkeys(bindings: readonly HotkeyBinding[], enabled = true): void {
  const ref = useRef(bindings)
  useEffect(() => {
    ref.current = bindings
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return
      const typing = isTypingTarget(event.target)
      for (const binding of ref.current) {
        if (binding.enabled === false || (typing && !binding.allowInInputs)) continue
        const combos = typeof binding.combo === 'string' ? [binding.combo] : binding.combo
        if (!combos.some((c) => matchHotkey(event, c))) continue
        if (binding.preventDefault !== false) event.preventDefault()
        binding.handler(event)
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
