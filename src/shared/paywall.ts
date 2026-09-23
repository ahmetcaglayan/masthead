/**
 * Paywall signals publishers put in their pages for search engines and social networks.
 * Reader mode respects them: an article its publisher keeps for subscribers is not turned
 * into text; the reader points to the publisher's page instead.
 */

/** `article:content_tier` values (Open Graph) of articles behind a paywall, hard or metered. */
export const PAYWALL_TIERS: readonly string[] = ['locked', 'metered']

const NESTED = ['@graph', 'mainEntity', 'mainEntityOfPage', 'hasPart', 'isPartOf'] as const

/**
 * Whether schema.org JSON-LD marks the page, or a part of it, as not free to read
 * (`isAccessibleForFree: false`, also written as the string "False").
 */
export function jsonLdDeclaresPaywall(data: unknown, depth = 0): boolean {
  if (depth > 5) return false
  if (Array.isArray(data)) return data.some((item) => jsonLdDeclaresPaywall(item, depth + 1))
  if (!data || typeof data !== 'object') return false
  const node = data as Record<string, unknown>
  const free = node.isAccessibleForFree
  if (free === false || (typeof free === 'string' && free.trim().toLowerCase() === 'false')) return true
  return NESTED.some((key) => jsonLdDeclaresPaywall(node[key], depth + 1))
}
