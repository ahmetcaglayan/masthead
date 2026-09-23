import { TOPIC_CATEGORIES, type CategoryId } from '@shared/categories'
import type { Settings } from '@shared/settings'
import type { Article, StoryCluster } from '@shared/types'
import { foldText } from './fold'
import { headlineQuality, isBreakingNews, isRoutineHeadline } from './headline'
import { storyKey, storySources } from './story'

export { storyKey }

const HOUR = 3_600_000

/** A manşet story must have been updated within this window. */
const HERO_MAX_AGE = 12 * HOUR
const BREAKING_WINDOW = 2 * HOUR
const SECTION_WINDOW = 48 * HOUR
const DIGEST_MAX_AGE = 36 * HOUR
const FOR_YOU_WINDOW = 48 * HOUR

const SECONDARY_COUNT = 3
const LATEST_COUNT = 30
const RELATED_MAX = 4
const SECTION_MAX = 7
const SECTION_MIN = 5
const INTEREST_SECTION_MIN = 3
const MAX_SECTIONS = 10

/**
 * What curation works on: the articles of the enabled sources, newest first
 * (`NewsView.articles`), and the snapshot's clusters. Results are cached on the
 * identity of both arrays, so pass the shared ones, not copies.
 */
export interface CurationInput {
  articles: readonly Article[]
  clusters: readonly StoryCluster[]
}

/** The manşet: the leading story, its cluster and other outlets' headlines for it. */
export interface HeroStory {
  lead: Article
  cluster?: StoryCluster
  /** Other sources' reports of the same story, the ones adding the most new detail first. */
  related: Article[]
  /** Distinct sources that carried the story. */
  sourceCount: number
  /** Newest report of the story (epoch ms); the lead itself may be older. */
  updatedAt: number
}

export interface HomeSection {
  category: CategoryId
  /** 3–7 stories; the first always has an image when any candidate does. */
  articles: Article[]
}

export interface HomeLayout {
  hero: HeroStory | null
  /** Next strongest stories with images (up to 3). */
  secondary: Article[]
  /** Breaking reports of the last 2 hours, newest first, one per story. */
  breaking: Article[]
  /** Newest reports, one per story. */
  latest: Article[]
  /** Topic sections: the user's interests first, then other busy topics. No story repeats on the page. */
  sections: HomeSection[]
}

/** One story of the "Gündem Özeti": the lead report plus what every other source said. */
export interface DigestStory {
  readonly id: string
  readonly cluster: StoryCluster
  readonly lead: Article
  /** One report per other source, the ones adding the most new detail first (worked out on first access). */
  readonly others: Article[]
  readonly sourceCount: number
  readonly updatedAt: number
}

interface ClusterEntry {
  cluster: StoryCluster
  /** Members from enabled sources, newest first. */
  members: Article[]
  /** Distinct sources among `members`. */
  sources: number
}

interface Pool {
  /** Articles from enabled sources, newest first. */
  articles: readonly Article[]
  /** The same articles per category (built on first use). */
  byCategory?: Map<CategoryId, Article[]>
  /** Clusters with at least one enabled member, highest score first. */
  clusters: ClusterEntry[]
  byCluster: Map<string, ClusterEntry>
}

const newestFirst = (a: Article, b: Article): number => b.publishedAt - a.publishedAt

const distinctSources = (articles: readonly Article[]): number =>
  new Set(articles.map((a) => a.sourceId)).size

let poolCache: { articles: readonly Article[]; clusters: readonly StoryCluster[]; pool: Pool } | null = null

function poolOf({ articles, clusters }: CurationInput): Pool {
  if (poolCache && poolCache.articles === articles && poolCache.clusters === clusters) return poolCache.pool
  const byId = new Map(articles.map((a) => [a.id, a]))
  const entries: ClusterEntry[] = []
  for (const cluster of [...clusters].sort((a, b) => b.score - a.score)) {
    const members: Article[] = []
    for (const id of cluster.articleIds) {
      const article = byId.get(id)
      if (article) members.push(article)
    }
    if (members.length === 0) continue
    members.sort(newestFirst)
    entries.push({ cluster, members, sources: distinctSources(members) })
  }
  const pool: Pool = {
    articles,
    clusters: entries,
    byCluster: new Map(entries.map((e) => [e.cluster.id, e]))
  }
  poolCache = { articles, clusters, pool }
  return pool
}

function inCategory(pool: Pool, category: CategoryId): readonly Article[] {
  if (!pool.byCategory) {
    const map = new Map<CategoryId, Article[]>()
    for (const article of pool.articles) {
      for (const c of article.categories) {
        const list = map.get(c)
        if (list) list.push(article)
        else map.set(c, [article])
      }
    }
    pool.byCategory = map
  }
  return pool.byCategory.get(category) ?? []
}

/**
 * Best report to lead a story: one with an image, then the cleanest headline
 * (not cut off with "…", not shouting in capitals, no "SON DAKİKA" label), then
 * one published within the manşet window, then a front-page report, then the
 * longest summary, then the newest.
 */
export function pickLead(members: readonly Article[], now: number): Article {
  const rank = (a: Article): number[] => [
    Number(Boolean(a.image)),
    headlineQuality(a.title),
    Number(now - a.publishedAt <= HERO_MAX_AGE),
    Number(a.isHeadline),
    a.summary.length,
    a.publishedAt
  ]
  let best = members[0]
  let bestRank = rank(best)
  for (const candidate of members.slice(1)) {
    const candidateRank = rank(candidate)
    for (let i = 0; i < candidateRank.length; i++) {
      if (candidateRank[i] === bestRank[i]) continue
      if (candidateRank[i] > bestRank[i]) {
        best = candidate
        bestRank = candidateRank
      }
      break
    }
  }
  return best
}

const leadOf = ({ members }: ClusterEntry, now: number): Article => pickLead(members, now)

interface TitleInfo {
  folded: string
  /** Significant headline words, folded and cut to 5 letters so Turkish suffixes still match. */
  stems: ReadonlySet<string>
}

/** Folding is the costly part of comparing headlines; titles repeat across snapshots, so keep them. */
const titles = new Map<string, TitleInfo>()
const TITLE_CACHE_MAX = 30_000

/** Filler stems that say nothing about what a headline adds ("için", "sonra", "son dakika"…). */
const STOP_STEMS = new Set(
  'icin sonra olara olan daha kadar gibi ancak bugun dakik haber flas canli iste nedir neler nasil hakki taraf uzeri yenid'.split(
    ' '
  )
)

function titleInfo(title: string): TitleInfo {
  let info = titles.get(title)
  if (!info) {
    const folded = foldText(title)
    const stems = new Set<string>()
    for (const word of folded.split(/[^\p{L}\p{N}]+/u)) {
      if (!(word.length >= 4 || (word.length >= 2 && /^\d+$/.test(word)))) continue
      const stem = word.slice(0, 5)
      if (!STOP_STEMS.has(stem)) stems.add(stem)
    }
    info = { folded, stems }
    if (titles.size >= TITLE_CACHE_MAX) titles.clear()
    titles.set(title, info)
  }
  return info
}

/** Reports this similar (Jaccard of headline stems) to the lead or an earlier pick add nothing new. */
const NEAR_COPY = 0.7

function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let shared = 0
  for (const stem of a) if (b.has(stem)) shared++
  return shared / (a.size + b.size - shared)
}

/**
 * The other sources' reports of a story, one per source (not the lead's),
 * ranked by what they add: on-topic reports (sharing a headline word with the
 * lead) are picked greedily by how many headline words they bring that the
 * lead and earlier picks did not, newest first among equals. Close paraphrases
 * (Jaccard >= 0.7 against the lead or a pick) go to the tail, then off-topic
 * reports unless `minOverlap` drops them. `distinctOnly` drops word-for-word
 * copies of the lead's headline (agency copy).
 */
function otherReports(
  lead: Article,
  members: readonly Article[],
  { minOverlap = 0, distinctOnly = false } = {}
): Article[] {
  const { folded: leadTitle, stems: leadStems } = titleInfo(lead.title)
  const onTopic: { a: Article; stems: ReadonlySet<string> }[] = []
  const offTopic: Article[] = []
  for (const a of [...members].sort(newestFirst)) {
    if (a.sourceId === lead.sourceId) continue
    const { folded, stems } = titleInfo(a.title)
    if (distinctOnly && folded === leadTitle) continue
    let overlap = 0
    for (const stem of stems) if (leadStems.has(stem)) overlap++
    if (overlap >= 1) onTopic.push({ a, stems })
    else if (overlap >= minOverlap) offTopic.push(a)
  }

  const seen = new Set(leadStems)
  const kept: ReadonlySet<string>[] = [leadStems]
  const usedSources = new Set<string>()
  const picked: Article[] = []
  const tail: Article[] = []
  const pool = [...onTopic]
  while (pool.length > 0) {
    let best = -1
    let bestNovelty = -1
    for (let i = 0; i < pool.length; i++) {
      if (usedSources.has(pool[i].a.sourceId)) continue
      let novelty = 0
      for (const stem of pool[i].stems) if (!seen.has(stem)) novelty++
      if (novelty > bestNovelty) {
        best = i
        bestNovelty = novelty
      }
    }
    if (best < 0) break
    const [{ a, stems }] = pool.splice(best, 1)
    usedSources.add(a.sourceId)
    if (kept.some((other) => jaccard(stems, other) >= NEAR_COPY)) {
      tail.push(a)
      continue
    }
    picked.push(a)
    kept.push(stems)
    for (const stem of stems) seen.add(stem)
  }
  for (const a of offTopic) {
    if (usedSources.has(a.sourceId)) continue
    usedSources.add(a.sourceId)
    tail.push(a)
  }
  return [...picked, ...tail]
}

function heroStory(entry: ClusterEntry | undefined, lead: Article): HeroStory {
  if (!entry) return { lead, related: [], sourceCount: 1, updatedAt: lead.publishedAt }
  return {
    lead,
    cluster: entry.cluster,
    related: otherReports(lead, entry.members, { minOverlap: 1, distinctOnly: true }).slice(0, RELATED_MAX),
    sourceCount: entry.sources,
    updatedAt: Math.max(lead.publishedAt, entry.members[0].publishedAt)
  }
}

/** Manşet treatment for any article: how many sources carried its story and what they headlined. */
export function storyFor(article: Article, input: CurationInput): HeroStory {
  const pool = poolOf(input)
  return heroStory(article.clusterId ? pool.byCluster.get(article.clusterId) : undefined, article)
}

function pickHero(pool: Pool, now: number): HeroStory | null {
  for (const entry of pool.clusters) {
    if (now - entry.cluster.updatedAt > HERO_MAX_AGE) continue
    const lead = leadOf(entry, now)
    // The daily gazette or market close never leads the front page, however many outlets run it.
    if (lead.image && !isRoutineHeadline(lead.title)) return heroStory(entry, lead)
  }
  const fresh = pool.articles.filter(
    (a) => a.image && now - a.publishedAt <= HERO_MAX_AGE && !isRoutineHeadline(a.title)
  )
  const lead =
    fresh.find((a) => a.isHeadline) ?? fresh[0] ?? pool.articles.find((a) => a.image) ?? pool.articles[0]
  if (!lead) return null
  return heroStory(lead.clusterId ? pool.byCluster.get(lead.clusterId) : undefined, lead)
}

/** Ranking inside a topic: coverage and front-page placement, fading with a 10-hour half-life. */
function storyScore(article: Article, pool: Pool, now: number): number {
  const entry = article.clusterId ? pool.byCluster.get(article.clusterId) : undefined
  const sources = entry ? entry.sources : 1
  const base = 1 + Math.log2(1 + sources) * 1.5 + (article.isHeadline ? 1 : 0)
  return base * 0.5 ** (Math.max(0, now - article.publishedAt) / (10 * HOUR))
}

function pickSection(pool: Pool, category: CategoryId, used: ReadonlySet<string>, now: number): Article[] {
  const seen = new Set<string>()
  const candidates: { article: Article; score: number }[] = []
  for (const article of inCategory(pool, category)) {
    if (now - article.publishedAt > SECTION_WINDOW) break
    const key = storyKey(article)
    if (used.has(key) || seen.has(key)) continue
    seen.add(key)
    candidates.push({ article, score: storyScore(article, pool, now) })
  }
  candidates.sort(
    (a, b) => Number(Boolean(b.article.image)) - Number(Boolean(a.article.image)) || b.score - a.score
  )
  return candidates.slice(0, SECTION_MAX).map((c) => c.article)
}

function layoutHome(pool: Pool, interestList: readonly CategoryId[], now: number): HomeLayout {
  const used = new Set<string>()

  const hero = pickHero(pool, now)
  if (hero) used.add(storyKey(hero.lead))

  const secondary: Article[] = []
  const take = (article: Article): void => {
    secondary.push(article)
    used.add(storyKey(article))
  }
  for (const entry of pool.clusters) {
    if (secondary.length >= SECONDARY_COUNT) break
    if (used.has(entry.cluster.id) || now - entry.cluster.updatedAt > HERO_MAX_AGE) continue
    const lead = leadOf(entry, now)
    if (lead.image && !isRoutineHeadline(lead.title)) take(lead)
  }
  for (const pass of [(a: Article) => a.isHeadline, () => true]) {
    for (const article of pool.articles) {
      if (secondary.length >= SECONDARY_COUNT) break
      if (!article.image || now - article.publishedAt > HERO_MAX_AGE || isRoutineHeadline(article.title))
        continue
      if (!used.has(storyKey(article)) && pass(article)) take(article)
    }
  }

  const breaking: Article[] = []
  const breakingStories = new Set<string>()
  for (const article of pool.articles) {
    if (now - article.publishedAt > BREAKING_WINDOW) break
    // Routine scheduled items (the daily gazette, the market close…) never make the ticker.
    if (!isBreakingNews(article) || breakingStories.has(storyKey(article))) continue
    breakingStories.add(storyKey(article))
    breaking.push(article)
  }

  const latest: Article[] = []
  const latestStories = new Set<string>()
  for (const article of pool.articles) {
    if (latest.length >= LATEST_COUNT) break
    if (latestStories.has(storyKey(article))) continue
    latestStories.add(storyKey(article))
    latest.push(article)
  }

  const interests = interestList.filter((c) => TOPIC_CATEGORIES.includes(c))
  const order = [...interests, ...TOPIC_CATEGORIES.filter((c) => !interests.includes(c))]
  const sections: HomeSection[] = []
  for (const category of order) {
    if (sections.length >= MAX_SECTIONS) break
    const articles = pickSection(pool, category, used, now)
    if (articles.length < (interests.includes(category) ? INTEREST_SECTION_MIN : SECTION_MIN)) continue
    for (const article of articles) used.add(storyKey(article))
    sections.push({ category, articles })
  }

  return { hero, secondary, breaking, latest, sections }
}

let homeCache: { pool: Pool; interests: readonly CategoryId[]; now: number; layout: HomeLayout } | null = null

/**
 * Lay out the home page: manşet, secondary headlines, breaking ticker, latest
 * column and topic sections. Only the enabled sources' articles take part and
 * no story appears twice among the manşet, secondary and topic slots. Cached
 * on the inputs, so returning to the front page does not lay it out again.
 */
export function buildHome(
  input: CurationInput,
  settings: Pick<Settings, 'interests'>,
  now: number
): HomeLayout {
  const pool = poolOf(input)
  const { interests } = settings
  if (homeCache && homeCache.pool === pool && homeCache.interests === interests && homeCache.now === now) {
    return homeCache.layout
  }
  const layout = layoutHome(pool, interests, now)
  homeCache = { pool, interests, now, layout }
  return layout
}

/** A digest story whose other reports are only compared once something reads them. */
class PooledDigestStory implements DigestStory {
  readonly id: string
  readonly cluster: StoryCluster
  readonly lead: Article
  readonly sourceCount: number
  readonly updatedAt: number
  private readonly members: readonly Article[]
  private cachedOthers: Article[] | undefined

  constructor(entry: ClusterEntry, now: number) {
    this.id = entry.cluster.id
    this.cluster = entry.cluster
    this.lead = leadOf(entry, now)
    this.members = entry.members
    this.sourceCount = entry.sources
    this.updatedAt = entry.members[0].publishedAt
  }

  get others(): Article[] {
    this.cachedOthers ??= otherReports(this.lead, this.members)
    return this.cachedOthers
  }
}

let digestCache: { pool: Pool; now: number; stories: DigestStory[] } | null = null

/**
 * The "Gündem Özeti": every current story with what each source reported.
 * Stories covered by two or more sources come first (by cluster score), then
 * notable single-source stories such as fresh front-page headlines. Cached on
 * the inputs; each story compares its reports only when they are shown.
 */
export function buildDigest(input: CurationInput, now: number): DigestStory[] {
  const pool = poolOf(input)
  if (digestCache && digestCache.pool === pool && digestCache.now === now) return digestCache.stories
  const multi: DigestStory[] = []
  const single: DigestStory[] = []
  for (const entry of pool.clusters) {
    if (now - entry.cluster.updatedAt > DIGEST_MAX_AGE) continue
    const story = new PooledDigestStory(entry, now)
    if (story.sourceCount >= 2) multi.push(story)
    else single.push(story)
  }
  const stories = [...multi, ...single]
  digestCache = { pool, now, stories }
  return stories
}

/**
 * The strongest stories among `articles`, one report per story: coverage
 * within `articles` (see `storySources`), front-page placement and an image
 * count, fading with a 10-hour half-life. Used for a topic or city page's lead
 * and the stories beside it, so a report loosely attached to a big story does
 * not lead a topic on the strength of the whole cluster. Routine scheduled
 * items (the market close…) never lead; they stay in the list below.
 */
export function topStories(articles: readonly Article[], now: number, limit = 5): Article[] {
  // One report per story: the first seen (newest, for a chronological list), unless a later one has an image.
  const reports = new Map<string, Article>()
  for (const article of articles) {
    const current = reports.get(storyKey(article))
    if (!current || (!current.image && article.image)) reports.set(storyKey(article), article)
  }
  const counts = storySources(articles)
  const scored: { article: Article; score: number }[] = []
  for (const article of reports.values()) {
    if (isRoutineHeadline(article.title)) continue
    const sources = counts.get(storyKey(article)) ?? 1
    const base = 1 + Math.log2(1 + sources) * 1.5 + (article.isHeadline ? 1 : 0) + (article.image ? 1.5 : 0)
    scored.push({ article, score: base * 0.5 ** (Math.max(0, now - article.publishedAt) / (10 * HOUR)) })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.article)
}

export interface ForYouContext {
  now: number
  readIds: ReadonlySet<string>
  clustersById: ReadonlyMap<string, StoryCluster>
}

/**
 * A personal mix of the last two days: stories in the user's interests (earlier
 * interests weigh more), about their province or region, or widely covered;
 * boosted by coverage, fading with a 10-hour half-life. One report per story;
 * already-read stories sink to the end. `articles` must be newest first.
 */
export function rankForYou(
  articles: readonly Article[],
  settings: Pick<Settings, 'interests' | 'location'>,
  ctx: ForYouContext
): Article[] {
  const { interests } = settings
  const weights = new Map(interests.map((c, i) => [c, 1 + (interests.length - i) / interests.length]))
  const { provinceCode, regionId } = settings.location
  const seen = new Set<string>()
  const scored: { article: Article; score: number; read: boolean }[] = []

  for (const article of articles) {
    const age = Math.max(0, ctx.now - article.publishedAt)
    if (age > FOR_YOU_WINDOW) break
    const key = storyKey(article)
    if (seen.has(key)) continue
    let interest = 0
    for (const c of article.categories) interest = Math.max(interest, weights.get(c) ?? 0)
    const local =
      provinceCode && article.provinces.includes(provinceCode)
        ? 1.5
        : regionId && article.regions.includes(regionId)
          ? 0.75
          : 0
    const cluster = article.clusterId ? ctx.clustersById.get(article.clusterId) : undefined
    const sources = cluster ? cluster.sourceIds.length : 1
    if (interest === 0 && local === 0 && sources < 3) continue
    seen.add(key)
    const base =
      interest +
      local +
      Math.log2(1 + sources) * 0.8 +
      (article.isHeadline ? 0.5 : 0) +
      (isBreakingNews(article) ? 0.4 : 0)
    scored.push({ article, score: base * 0.5 ** (age / (10 * HOUR)), read: ctx.readIds.has(article.id) })
  }

  scored.sort((a, b) => Number(a.read) - Number(b.read) || b.score - a.score)
  return scored.map((s) => s.article)
}
