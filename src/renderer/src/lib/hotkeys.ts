/**
 * Keyboard shortcut helpers. Combos are written as `Mod+K`, `Alt+ArrowLeft`,
 * `Shift+?`, `F5`: modifiers joined with `+`, then a `KeyboardEvent.key` value
 * (case-insensitive). `Mod` is ⌘ on macOS and Ctrl elsewhere.
 */

export const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

interface ParsedCombo {
  key: string
  ctrl: boolean
  meta: boolean
  alt: boolean
  shift: boolean
}

const parsed = new Map<string, ParsedCombo>()

function parse(combo: string): ParsedCombo {
  let result = parsed.get(combo)
  if (result) return result
  // A trailing "+" is the plus key itself (`Mod++`).
  const parts = combo.endsWith('++') ? [...combo.slice(0, -2).split('+'), '+'] : combo.split('+')
  const key = (parts.pop() ?? '').toLowerCase()
  const mods = new Set(parts.map((p) => p.toLowerCase()))
  const mod = mods.has('mod')
  result = {
    key,
    ctrl: mods.has('ctrl') || (mod && !IS_MAC),
    meta: mods.has('meta') || mods.has('cmd') || (mod && IS_MAC),
    alt: mods.has('alt') || mods.has('option'),
    shift: mods.has('shift')
  }
  parsed.set(combo, result)
  return result
}

/** True when the keyboard event is exactly this combo (extra modifiers don't match). */
export function matchHotkey(event: KeyboardEvent, combo: string): boolean {
  const c = parse(combo)
  if (event.ctrlKey !== c.ctrl || event.metaKey !== c.meta || event.altKey !== c.alt) return false
  // Shift is implied by printable symbols like "?" — only enforce it for named/letter keys.
  const key = event.key.toLowerCase()
  const symbol = key.length === 1 && !/[a-z0-9]/.test(key)
  if (!symbol && event.shiftKey !== c.shift) return false
  return key === c.key || (c.key.length === 1 && event.code.toLowerCase() === `key${c.key}`)
}

/** True when the event comes from somewhere the user is typing (inputs, textareas, contenteditable). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(target.type)
  }
  return false
}

const KEY_LABELS: Record<string, [mac: string, other: string]> = {
  mod: ['⌘', 'Ctrl'],
  ctrl: ['⌃', 'Ctrl'],
  meta: ['⌘', 'Win'],
  cmd: ['⌘', 'Ctrl'],
  alt: ['⌥', 'Alt'],
  option: ['⌥', 'Alt'],
  shift: ['⇧', 'Shift'],
  arrowleft: ['←', '←'],
  arrowright: ['→', '→'],
  arrowup: ['↑', '↑'],
  arrowdown: ['↓', '↓'],
  enter: ['↵', 'Enter'],
  escape: ['Esc', 'Esc'],
  backspace: ['⌫', 'Backspace'],
  ' ': ['Space', 'Space']
}

/** Human-readable keys of a combo for the current platform: `Mod+K` → `['Ctrl', 'K']` or `['⌘', 'K']`. */
export function hotkeyParts(combo: string): string[] {
  const parts = combo.endsWith('++') ? [...combo.slice(0, -2).split('+'), '+'] : combo.split('+')
  return parts.map((part) => {
    const label = KEY_LABELS[part.toLowerCase()]
    if (label) return IS_MAC ? label[0] : label[1]
    return part.length === 1 ? part.toUpperCase() : part
  })
}

/** A combo as one string for tooltips and aria-keyshortcuts hints: `Ctrl+K` / `⌘K`. */
export function formatHotkey(combo: string): string {
  return hotkeyParts(combo).join(IS_MAC ? '' : '+')
}
