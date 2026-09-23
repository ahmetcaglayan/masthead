/**
 * Story clustering: groups articles from different sources that report the same
 * event, using folded, stemmed headline tokens. Candidate pairs come from an
 * inverted index (never all pairs), similarity is Jaccard over stems plus a bonus
 * for shared proper nouns and numbers, and linked pairs are merged strongest first
 * with union-find, each group anchored to the article that founded it.
 */
import type { Article, StoryCluster } from '../../shared/types'
import { foldTr, isRoutineTitle, isShouting, isTruncatedTitle } from './text'

/** How fresh a breaking-feed report and the second source's coverage must be for breaking news. */
export const BREAKING_WINDOW_MS = 60 * 60_000

export interface ClusterOptions {
  now: number
  /** Only articles published within this many hours are clustered (default 36). */
  windowHours?: number
  /**
   * Ids of articles whose headline carried an explicit breaking marker ("SON DAKİKA:").
   * Defaults to the articles whose `isBreaking` is set.
   */
  marked?: ReadonlySet<string>
}

export interface ClusterResult {
  /** Highest score first. */
  clusters: StoryCluster[]
  clusterOf: Map<string, string>
  /**
   * Ids of the articles that are breaking news: an explicit marker in the headline, or
   * a report from a breaking ("son dakika") feed — `breaking` category — published in
   * the last hour whose story at least two sources have reported in the last hour.
   * Son dakika feeds are mostly plain "latest" streams, so a report alone does not
   * make breaking news.
   */
  breaking: Set<string>
}

const MIN_SIMILARITY = 0.35
const MIN_SHARED_STEMS = 2
const PROPER_BONUS = 0.08
const MAX_PROPER_BONUS = 0.24
const STEM_LENGTH = 6
/** Stems in more than this share of the corpus are too common to propose candidates. */
const MAX_DF_SHARE = 0.05
const MIN_DF_CAP = 10
const HALF_LIFE_HOURS = 6
/** Score multiplier for daily service items (Gazette digest, weather, rates…). */
const ROUTINE_WEIGHT = 0.3
const SINGLETON_MAX_AGE_HOURS = 12

/**
 * Turkish function words, news filler and calendar words, folded. Dates ("22 Eylül
 * 2026") appear in unrelated daily headlines and must not tie them together.
 */
const STOP_WORDS = new Set(
  (
    've ile veya ya da de ki mi mu bu su o bir icin gibi kadar daha en cok her hem ama fakat ancak ise ne neden ' +
    'nasil niye kim hangi olan olarak oldu olmus oldugu olmak olacak etti eden etmek yapti yapan yapildi dedi var ' +
    'yok tum butun sonra once uzerine karsi gore son dakika flas video izle canli galeri foto fotograf iste ' +
    'aciklama acikladi haber haberi haberleri sizce bakin iddia yeni ilk bugun dun yarin gunu gunluk ' +
    'ocak subat mart nisan mayis haziran temmuz agustos eylul ekim kasim aralik ' +
    'pazartesi sali carsamba persembe cuma cumartesi pazar'
  ).split(' ')
)

const TOKEN = /\d+(?:[.,:-]\d+)*|[\p{L}]+/gu
const APOSTROPHE_SUFFIX = /['’‘´`]\p{L}+/gu
const YEAR = /^(?:19|20)\d\d$/
/** Numbers specific enough to identify a story: 5,8 · 3-1 · 14:30 · 160. */
const DISTINCTIVE_NUMBER = /\D|\d{3}/

export interface TitleFeatures {
  stems: Set<string>
  /** Stems of capitalised words (not the first) and distinctive numbers. */
  proper: Set<string>
}

/** Headline features: stop words and apostrophe suffixes dropped, words cut to 6 letters, numbers kept. */
export function titleFeatures(title: string): TitleFeatures {
  const stems = new Set<string>()
  const proper = new Set<string>()
  const text = title.replace(APOSTROPHE_SUFFIX, '')
  // Fold once; per-word folding is the fallback for the rare text whose length folding changes.
  const foldedText = foldTr(text)
  const fold = (word: string, start: number): string =>
    foldedText.length === text.length ? foldedText.slice(start, start + word.length) : foldTr(word)
  const words = [...text.matchAll(TOKEN)]
  const capitalised = words.filter(([w]) => w[0] !== w[0].toLowerCase()).length
  const shouting = words.length > 2 && capitalised / words.length > 0.6
  words.forEach((match, i) => {
    const word = match[0]
    if (/^\d/.test(word)) {
      if (YEAR.test(word)) return
      const number = word.replace(/,/g, '.')
      stems.add(number)
      if (DISTINCTIVE_NUMBER.test(number)) proper.add(number)
      return
    }
    const folded = fold(word, match.index)
    if (folded.length < 2 || STOP_WORDS.has(folded)) return
    const stem = folded.slice(0, STEM_LENGTH)
    stems.add(stem)
    if (!shouting && i > 0 && word[0] !== word[0].toLowerCase()) proper.add(stem)
  })
  return { stems, proper }
}

/** Headlines rarely change between refreshes, so their features are memoised (bounded). */
const featureCache = new Map<string, TitleFeatures>()
const FEATURE_CACHE_LIMIT = 20_000

function cachedFeatures(title: string): TitleFeatures {
  let features = featureCache.get(title)
  if (!features) {
    if (featureCache.size >= FEATURE_CACHE_LIMIT) featureCache.clear()
    features = titleFeatures(title)
    featureCache.set(title, features)
  }
  return features
}

/** Features as sorted stem ids, so a similarity is two linear merges over small integer arrays. */
interface Encoded {
  stems: Int32Array
  proper: Int32Array
}

function sharedCount(a: Int32Array, b: Int32Array): number {
  let shared = 0
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) {
      shared++
      i++
      j++
    } else if (a[i] < b[j]) i++
    else j++
  }
  return shared
}

/** Similarity of two headlines, or 0 when they do not qualify as the same story. */
function similarity(a: Encoded, b: Encoded): number {
  const shared = sharedCount(a.stems, b.stems)
  if (shared < MIN_SHARED_STEMS) return 0
  const jaccard = shared / (a.stems.length + b.stems.length - shared)
  const bonus = Math.min(sharedCount(a.proper, b.proper) * PROPER_BONUS, MAX_PROPER_BONUS)
  return jaccard + bonus >= MIN_SIMILARITY ? jaccard + bonus : 0
}

function find(parent: Int32Array, i: number): number {
  while (parent[i] !== i) {
    parent[i] = parent[parent[i]]
    i = parent[i]
  }
  return i
}

/** Manşet ranking: sources, front-page and breaking bonuses, image bonus, halved every 6 hours. */
function score(
  members: Article[],
  lead: Article,
  now: number,
  updatedAt: number,
  breaking: ReadonlySet<string>
): number {
  const sources = new Set(members.map((a) => a.sourceId)).size
  const base =
    10 * Math.log2(1 + sources) +
    (members.some((a) => a.isHeadline) ? 6 : 0) +
    (members.some((a) => breaking.has(a.id)) ? 4 : 0) +
    (lead.image ? 2 : 0)
  const ageHours = Math.max(0, now - updatedAt) / 3_600_000
  // Every outlet republishes the daily Gazette digest or the weather; that is not a manşet.
  const routine = routineTitle(lead.title) ? ROUTINE_WEIGHT : 1
  return base * routine * 0.5 ** (ageHours / HALF_LIFE_HOURS)
}

/** Headlines are memoised with their features; so is whether they are routine service items. */
const routineCache = new Map<string, boolean>()

function routineTitle(title: string): boolean {
  let value = routineCache.get(title)
  if (value === undefined) {
    if (routineCache.size >= FEATURE_CACHE_LIMIT) routineCache.clear()
    value = isRoutineTitle(title)
    routineCache.set(title, value)
  }
  return value
}

/** Headlines are memoised with their features; so is whether they are set in capitals. */
const shoutingCache = new Map<string, boolean>()

function shouting(title: string): boolean {
  let value = shoutingCache.get(title)
  if (value === undefined) {
    if (shoutingCache.size >= FEATURE_CACHE_LIMIT) shoutingCache.clear()
    value = isShouting(title)
    shoutingCache.set(title, value)
  }
  return value
}

/**
 * Lead: a headline in normal case (an all-caps one never headlines a story another
 * outlet wrote calmly), then one the outlet did not cut short with "...", then has
 * an image, then front-page feed, then longest summary, then newest.
 */
function pickLead(members: Article[]): Article {
  return members.reduce((best, a) => {
    const byCase = Number(shouting(best.title)) - Number(shouting(a.title))
    if (byCase) return byCase > 0 ? a : best
    const byCut = Number(isTruncatedTitle(best.title)) - Number(isTruncatedTitle(a.title))
    if (byCut) return byCut > 0 ? a : best
    const byImage = Number(Boolean(a.image)) - Number(Boolean(best.image))
    if (byImage) return byImage > 0 ? a : best
    const byHeadline = Number(a.isHeadline) - Number(best.isHeadline)
    if (byHeadline) return byHeadline > 0 ? a : best
    const bySummary = a.summary.length - best.summary.length
    if (bySummary) return bySummary > 0 ? a : best
    return a.publishedAt > best.publishedAt ? a : best
  })
}

function buildCluster(members: Article[], now: number, breaking: ReadonlySet<string>): StoryCluster {
  const ordered = [...members].sort((a, b) => a.publishedAt - b.publishedAt || a.id.localeCompare(b.id))
  const lead = pickLead(ordered)
  const updatedAt = ordered[ordered.length - 1].publishedAt
  return {
    // Named after the earliest report so the id survives later additions.
    id: `c-${ordered[0].id}`,
    articleIds: ordered.map((a) => a.id),
    leadId: lead.id,
    sourceIds: [...new Set(ordered.map((a) => a.sourceId))],
    score: score(ordered, lead, now, updatedAt, breaking),
    updatedAt
  }
}

/** Add a story's recent breaking-feed reports when two or more sources reported it recently. */
function addCorroborated(members: Article[], since: number, breaking: Set<string>): void {
  const recent = members.filter((a) => a.publishedAt >= since)
  if (new Set(recent.map((a) => a.sourceId)).size < 2) return
  for (const report of recent) if (report.categories.includes('breaking')) breaking.add(report.id)
}

/**
 * Group articles that report the same story. A cluster needs at least two distinct
 * sources. Headline-feed articles younger than 12 hours that joined no cluster also
 * get a single-article cluster, so the manşet ranking can place a front-page story
 * that only one outlet has carried so far. Also decides which articles are breaking
 * news (see `ClusterResult.breaking`).
 */
export function clusterStories(articles: readonly Article[], options: ClusterOptions): ClusterResult {
  const { now, windowHours = 36 } = options
  const since = now - windowHours * 3_600_000
  const pool = articles.filter((a) => a.publishedAt >= since)

  const stemIds = new Map<string, number>()
  const encode = (stems: Set<string>): Int32Array => {
    const ids = new Int32Array(stems.size)
    let k = 0
    for (const stem of stems) {
      let id = stemIds.get(stem)
      if (id === undefined) stemIds.set(stem, (id = stemIds.size))
      ids[k++] = id
    }
    return ids.sort()
  }
  const features: Encoded[] = pool.map((article) => {
    const { stems, proper } = cachedFeatures(article.title)
    return { stems: encode(stems), proper: encode(proper) }
  })

  // Inverted index; lists are in ascending article order.
  const postings: number[][] = []
  features.forEach((f, i) => {
    for (const id of f.stems) (postings[id] ??= []).push(i)
  })
  const maxDf = Math.max(MIN_DF_CAP, Math.floor(pool.length * MAX_DF_SHARE))
  const common = features.map((f) => f.stems.filter((id) => postings[id].length > maxDf).length)

  // Count the uncommon stems each later article shares with article i, then score only
  // the pairs that can reach the required number of shared stems.
  const links: { i: number; j: number; sim: number }[] = []
  const shared = new Int32Array(pool.length)
  const touched: number[] = []
  for (let i = 0; i < pool.length; i++) {
    touched.length = 0
    for (const id of features[i].stems) {
      const list = postings[id]
      if (list.length > maxDf) continue
      for (let k = list.length - 1; k >= 0 && list[k] > i; k--) {
        if (shared[list[k]]++ === 0) touched.push(list[k])
      }
    }
    for (const j of touched) {
      const count = shared[j]
      shared[j] = 0
      if (count + Math.min(common[i], common[j]) < MIN_SHARED_STEMS) continue
      if (pool[j].sourceId === pool[i].sourceId) continue
      const sim = similarity(features[i], features[j])
      if (sim > 0) links.push({ i, j, sim })
    }
  }

  // Strongest links first. Each group keeps the article that founded it as its seed,
  // and two groups merge only when their seeds are similar too: this stops loosely
  // related headlines from chaining unrelated stories into one giant cluster.
  links.sort((a, b) => b.sim - a.sim)
  const parent = new Int32Array(pool.length).map((_, i) => i)
  const size = new Int32Array(pool.length).fill(1)
  for (const { i, j } of links) {
    const a = find(parent, i)
    const b = find(parent, j)
    if (a === b || ((a !== i || b !== j) && similarity(features[a], features[b]) === 0)) continue
    const [keep, join] = size[a] >= size[b] ? [a, b] : [b, a]
    parent[join] = keep
    size[keep] += size[join]
  }

  const groups = new Map<number, Article[]>()
  pool.forEach((article, i) => {
    const root = find(parent, i)
    const group = groups.get(root)
    if (group) group.push(article)
    else groups.set(root, [article])
  })

  const breaking = new Set<string>()
  for (const article of articles) {
    if (options.marked ? options.marked.has(article.id) : article.isBreaking) breaking.add(article.id)
  }
  const stories = [...groups.values()].filter((members) => new Set(members.map((a) => a.sourceId)).size >= 2)
  for (const members of stories) addCorroborated(members, now - BREAKING_WINDOW_MS, breaking)
  // A daily service item is never breaking news, whatever its "SON DAKİKA" tag says.
  for (const article of articles)
    if (breaking.has(article.id) && routineTitle(article.title)) breaking.delete(article.id)

  const clusters: StoryCluster[] = []
  const clusterOf = new Map<string, string>()
  const add = (cluster: StoryCluster): void => {
    clusters.push(cluster)
    for (const id of cluster.articleIds) clusterOf.set(id, cluster.id)
  }
  for (const members of stories) add(buildCluster(members, now, breaking))
  const singletonSince = now - SINGLETON_MAX_AGE_HOURS * 3_600_000
  for (const article of pool) {
    if (article.isHeadline && article.publishedAt >= singletonSince && !clusterOf.has(article.id)) {
      add(buildCluster([article], now, breaking))
    }
  }
  clusters.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt)
  return { clusters, clusterOf, breaking }
}
