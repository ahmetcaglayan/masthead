/**
 * Unified news categories. Every feed of every source maps onto exactly one of
 * these; the UI localises them through the `category.<id>` i18n keys.
 */
export const CATEGORY_IDS = [
  'top',
  'breaking',
  'general',
  'national',
  'world',
  'politics',
  'economy',
  'sports',
  'technology',
  'science',
  'health',
  'culture',
  'entertainment',
  'lifestyle',
  'education',
  'automotive',
  'travel',
  'environment',
  'local',
  'opinion'
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

/**
 * Meta categories describe *how* a story was published (front-page headline,
 * breaking alert, catch-all "latest") rather than *what* it is about.
 */
export const META_CATEGORIES: readonly CategoryId[] = ['top', 'breaking', 'general']

/** Topic categories shown in the sidebar and offered as interests, in display order. */
export const TOPIC_CATEGORIES: readonly CategoryId[] = [
  'national',
  'world',
  'politics',
  'economy',
  'sports',
  'technology',
  'science',
  'health',
  'culture',
  'entertainment',
  'lifestyle',
  'education',
  'automotive',
  'travel',
  'environment',
  'opinion'
]

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_IDS as readonly string[]).includes(value)
}
