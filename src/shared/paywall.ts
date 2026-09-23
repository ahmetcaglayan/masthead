/**
 * Paywall signals publishers put in their pages for search engines and social networks.
 * Reader mode respects them: an article its publisher keeps for subscribers is not turned
 * into text; the reader points to the publisher's page instead.
 */

/** `article:content_tier` values (Open Graph) of articles behind a paywall, hard or metered. */
export const PAYWALL_TIERS: readonly string[] = ['locked', 'metered']

/** Where the article and its parts live; not `isPartOf` (the publication may be a paid one). */
const NESTED = ['@graph', 'mainEntity', 'hasPart'] as const

const flag = (value: unknown): boolean | undefined =>
  typeof value === 'boolean'
    ? value
    : typeof value === 'string' && /^(true|false)$/i.test(value.trim())
      ? value.trim().toLowerCase() === 'true'
      : undefined

/**
 * Whether schema.org JSON-LD marks the article, or a part of it, as not free to read
 * (`isAccessibleForFree: false`, also written as the string "False"). A node that says it
 * is free settles it for everything under it.
 */
export function jsonLdDeclaresPaywall(data: unknown, depth = 0): boolean {
  if (depth > 5) return false
  if (Array.isArray(data)) return data.some((item) => jsonLdDeclaresPaywall(item, depth + 1))
  if (!data || typeof data !== 'object') return false
  const node = data as Record<string, unknown>
  const free = flag(node.isAccessibleForFree)
  if (free !== undefined) return !free
  return NESTED.some((key) => jsonLdDeclaresPaywall(node[key], depth + 1))
}
