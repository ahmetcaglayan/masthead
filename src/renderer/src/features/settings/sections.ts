/** Settings page sections in display order; `{ name: 'settings', section }` scrolls to one. */
export const SETTINGS_SECTIONS = [
  'appearance',
  'typography',
  'language',
  'interests',
  'sources',
  'reading',
  'notifications',
  'updates',
  'data'
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]

/** DOM id of a section's element. */
export const sectionElementId = (id: string): string => `settings-${id}`
