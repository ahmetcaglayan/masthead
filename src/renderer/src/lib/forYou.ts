import { META_CATEGORIES, type CategoryId } from '@shared/categories'
import type { Settings } from '@shared/settings'
import type { Article, HistoryEntry, StoryCluster } from '@shared/types'
import { headlineStems, jaccard } from './curation'
import { foldText } from './fold'
import { isBreakingNews } from './headline'
import { storyKey } from './story'

const HOUR = 3_600_000
const DAY = 24 * HOUR

/** "For you" mixes the stories of the last two days. */
const FOR_YOU_WINDOW = 48 * HOUR

/** Reads older than this do not shape the profile; within it, newer reads count more. */
const PROFILE_WINDOW = 60 * DAY
const PROFILE_HALF_LIFE = 14 * DAY
const PROFILE_MAX_READS = 300
/** Fewer reads than this say too little: the feed then runs on interests and location only. */
export const MIN_READS = 5
const MAX_TERMS = 30
/**
 * A headline word belongs to the profile when the reads carry it more often than the news
 * at large, by more than chance explains (log-likelihood G² ≥ 10.83, p < 0.001): "Galatasaray"
 * for a fan, never "says", "after" or "istedi", however the reads happen to fall.
 */
const MIN_KEYNESS = 10.83
/** A topic belongs to the profile when it makes up this share of the reads… */
const MIN_TOPIC_SHARE = 0.15
/** …and is read this many times more than its share of the news. */
const MIN_TOPIC_LIFT = 1.5

/**
 * Something the user keeps reading about: one headline word, or words that always come
 * together in the reads ("Mansur Yavaş"), counted once. Weight 1 for the strongest.
 */
export interface ProfileTerm {
  /** Headline stems (see `headlineStems`), in headline order. */
  stems: readonly string[]
  /** As headlines spell it ("Galatasaray", "Mansur Yavaş"). */
  word: string
  weight: number
}

/** What recent reading says the user follows. Worked out on the device from the history. */
export interface ReadingProfile {
  /** Reads the profile is made from. */
  reads: number
  /** Strongest first. */
  terms: readonly ProfileTerm[]
  /** Topics read well beyond their share of the news → their share of the reads. */
  topics: ReadonlyMap<CategoryId, number>
}

export const EMPTY_PROFILE: ReadingProfile = { reads: 0, terms: [], topics: new Map() }

const isNumber = (stem: string): boolean => /^\d+$/.test(stem)

/** How headlines spell each stem's word, e.g. `galat` → "Galatasaray". */
function spellings(title: string, stems: ReadonlySet<string>, into: Map<string, Map<string, number>>): void {
  for (const raw of title.split(/[^\p{L}\p{M}\p{N}]+/u)) {
    const folded = foldText(raw)
    if (folded.length < 4) continue
    const stem = folded.slice(0, 5)
    if (!stems.has(stem)) continue
    let forms = into.get(stem)
    if (!forms) into.set(stem, (forms = new Map()))
    forms.set(raw, (forms.get(raw) ?? 0) + 1)
  }
}

/**
 * How to show a stem's word: not in all-capitals shouting ("GALATASARAY") when headlines
 * also spell it normally, and the shortest of the common spellings, so an inflection
 * ("gözaltına") gives way to the plain word ("gözaltı") when that turns up about as often.
 */
function bestSpelling(forms: ReadonlyMap<string, number> | undefined, stem: string): string {
  if (!forms) return stem
  const shouting = (word: string): boolean => word.length > 1 && word === word.toLocaleUpperCase()
  const all = [...forms]
  const calm = all.filter(([word]) => !shouting(word))
  const pool = calm.length > 0 ? calm : all
  const most = Math.max(...pool.map(([, count]) => count))
  return pool
    .filter(([, count]) => count * 2 >= most)
    .sort((a, b) => a[0].length - b[0].length || b[1] - a[1])[0][0]
}

/** Reads whose headlines share this much (Jaccard of stems) are one story. */
const SAME_STORY = 0.5
/** Stems that come together in this share of the stories of each are one term. */
const TOGETHER = 0.75
/** At most this many words to one term. */
const TERM_WORDS = 3

/**
 * How surely a word is typical of the reads rather than of the news (Dunning's log-likelihood):
 * `inReads` of `reads` stories carry it against `inNews` of `news` headlines. 0 when the
 * reads carry it no more often than the news does.
 */
export function keyness(inReads: number, reads: number, inNews: number, news: number): number {
  if (inReads / reads <= inNews / Math.max(1, news)) return 0
  const both = inReads + inNews
  const term = (observed: number, expected: number): number =>
    observed > 0 ? observed * Math.log(observed / expected) : 0
  return 2 * (term(inReads, (reads * both) / (reads + news)) + term(inNews, (news * both) / (reads + news)))
}

/** Where each stem first turns up in the headline, for putting a term's words in order. */
function stemOrder(title: string, stems: readonly string[]): string[] {
  const words = foldText(title).split(/[^\p{L}\p{N}]+/u)
  const at = (stem: string): number => {
    const i = words.findIndex((word) => word.slice(0, 5) === stem)
    return i < 0 ? words.length : i
  }
  return [...stems].sort((a, b) => at(a) - at(b))
}

/**
 * The reading profile: the words and topics the recent history (the last 60 days, newer
 * reads counting more) returns to far more often than the news in `pool` does. Comparing
 * with the news keeps generic words ("says", "after", "için") and the everyday topics out
 * without a stop-word list per language. Needs `MIN_READS` reads.
 */
export function buildReadingProfile(
  history: readonly HistoryEntry[],
  pool: readonly Article[],
  now: number
): ReadingProfile {
  const reads = history.filter((entry) => now - entry.readAt <= PROFILE_WINDOW).slice(0, PROFILE_MAX_READS)
  if (reads.length < MIN_READS) return { ...EMPTY_PROFILE, reads: reads.length }

  // Reads of one story (the same cluster, or near-identical headlines) count once: reading
  // three reports of a raid says nothing about an interest in raids.
  const stories: { weight: number; stems: Set<string>; titles: string[]; topics: Set<CategoryId> }[] = []
  const byCluster = new Map<string, number>()
  for (const { article, readAt } of reads) {
    const weight = 0.5 ** (Math.max(0, now - readAt) / PROFILE_HALF_LIFE)
    const stems = headlineStems(article.title)
    let index = article.clusterId ? byCluster.get(article.clusterId) : undefined
    index ??= stories.findIndex((story) => jaccard(story.stems, stems) >= SAME_STORY)
    if (index < 0) {
      index = stories.push({ weight, stems: new Set(), titles: [], topics: new Set() }) - 1
    }
    if (article.clusterId) byCluster.set(article.clusterId, index)
    const story = stories[index]
    story.weight = Math.max(story.weight, weight)
    for (const stem of stems) if (!isNumber(stem)) story.stems.add(stem)
    story.titles.push(article.title)
    for (const c of article.categories) if (!META_CATEGORIES.includes(c)) story.topics.add(c)
  }

  let total = 0
  const termWeight = new Map<string, number>()
  /** Which stories (by index) each stem is in. */
  const termStories = new Map<string, number[]>()
  const topicWeight = new Map<CategoryId, number>()
  const forms = new Map<string, Map<string, number>>()
  stories.forEach(({ weight, stems, titles, topics }, index) => {
    total += weight
    for (const stem of stems) {
      termWeight.set(stem, (termWeight.get(stem) ?? 0) + weight)
      const list = termStories.get(stem)
      if (list) list.push(index)
      else termStories.set(stem, [index])
    }
    for (const title of titles) spellings(title, stems, forms)
    for (const c of topics) topicWeight.set(c, (topicWeight.get(c) ?? 0) + weight)
  })

  // How common each candidate word and topic is in the news right now.
  const inNews = new Map<string, number>()
  const topicInNews = new Map<CategoryId, number>()
  for (const article of pool) {
    for (const stem of headlineStems(article.title)) {
      if (termWeight.has(stem)) inNews.set(stem, (inNews.get(stem) ?? 0) + 1)
    }
    for (const c of article.categories) {
      if (topicWeight.has(c)) topicInNews.set(c, (topicInNews.get(c) ?? 0) + 1)
    }
  }
  const newsShare = (count: number | undefined): number => ((count ?? 0) + 1) / (pool.length + 1)

  const scored: { stem: string; score: number }[] = []
  for (const [stem, weight] of termWeight) {
    if ((termStories.get(stem)?.length ?? 0) < 2) continue
    const score = keyness(weight, total, inNews.get(stem) ?? 0, pool.length)
    if (score >= MIN_KEYNESS) scored.push({ stem, score })
  }
  scored.sort((a, b) => b.score - a.score)

  // Words that keep coming together ("Mansur" and "Yavaş", "gözaltına" and "alındı") are one term.
  const groups: { stems: string[]; stories: ReadonlySet<number>; score: number }[] = []
  for (const { stem, score } of scored) {
    const mine = termStories.get(stem) ?? []
    const group = groups.find((g) => {
      if (g.stems.length >= TERM_WORDS) return false
      const shared = mine.filter((i) => g.stories.has(i)).length
      return shared >= TOGETHER * Math.max(mine.length, g.stories.size)
    })
    if (group) group.stems.push(stem)
    else if (groups.length < MAX_TERMS) groups.push({ stems: [stem], stories: new Set(mine), score })
  }
  const strongest = groups[0]?.score ?? 1
  const terms = groups.map(({ stems, stories: where, score }): ProfileTerm => {
    // Words in the order a headline carrying all of them has them.
    const titles = [...where].flatMap((i) => stories[i].titles)
    const title = titles.find((t) => stems.every((stem) => headlineStems(t).has(stem))) ?? titles[0]
    const ordered = stemOrder(title, stems)
    return {
      stems: ordered,
      word: ordered.map((stem) => bestSpelling(forms.get(stem), stem)).join(' '),
      weight: score / strongest
    }
  })

  const topics = new Map<CategoryId, number>()
  for (const [c, weight] of topicWeight) {
    const share = weight / total
    if (share >= MIN_TOPIC_SHARE && share / newsShare(topicInNews.get(c)) >= MIN_TOPIC_LIFT) {
      topics.set(c, share)
    }
  }

  return { reads: reads.length, terms, topics }
}

/** Why "For you" picked a story; the strongest reason is the one shown. */
export type ForYouReason =
  /** Its headline shares words with what the user reads (`word`: the strongest of them). */
  | { kind: 'reads'; word: string }
  | { kind: 'local'; scope: 'province' | 'region' }
  | { kind: 'interest'; category: CategoryId }
  /** A topic the reading history leans to, though not among the interests. */
  | { kind: 'habit'; category: CategoryId }
  | { kind: 'popular'; sources: number }

export interface ForYouContext {
  now: number
  readIds: ReadonlySet<string>
  clustersById: ReadonlyMap<string, StoryCluster>
  /** Leave out to rank by interests and location only. */
  profile?: ReadingProfile
}

export interface ForYouFeed {
  articles: Article[]
  /** By article id. */
  reasons: ReadonlyMap<string, ForYouReason>
}

/**
 * What the strongest profile term adds to a story's score: about as much as the first
 * interest, so a story like the reads rises to the top of its day without burying the
 * big stories everyone covers. Several terms add up to `SIMILAR_MAX`.
 */
const SIMILAR_WEIGHT = 2
const SIMILAR_MAX = 3
/** A story counts as like the reads from this much on (a middling term; weak ones only nudge). */
const SIMILAR = 0.8
/** A history-leaning topic brings a story in from this much weight on. */
const HABIT = 0.3
/** At most this many stories of one source in a row. */
const SAME_SOURCE_RUN = 2
/** How far ahead a story from another source is looked for to break a run. */
const RUN_LOOKAHEAD = 6

interface Scored {
  article: Article
  score: number
  reason: ForYouReason
  /** The profile term that matched best, and what the match added to `score`. */
  term?: ProfileTerm
  similar: number
}

/** Each further story of one profile term gets this much of the previous one's boost. */
const TERM_REPEAT = 0.7

/**
 * Diminishing returns per profile term: the best story about "yapay zeka" gets the whole
 * boost, the next 70% of it, the one after 49%… so four reads about AI do not fill the page.
 */
function spreadTerms(list: Scored[]): void {
  const seen = new Map<ProfileTerm, number>()
  for (const scored of list) {
    if (!scored.term) continue
    const repeats = seen.get(scored.term) ?? 0
    scored.score -= scored.similar * (1 - TERM_REPEAT ** repeats)
    seen.set(scored.term, repeats + 1)
  }
}

/** No more than two stories in a row from one outlet: pull the next other outlet's story forward. */
function spreadSources(list: Scored[]): Scored[] {
  const rest = [...list]
  const out: Scored[] = []
  while (rest.length > 0) {
    let pick = 0
    const run = out.slice(-SAME_SOURCE_RUN)
    const source = run[0]?.article.sourceId
    if (run.length === SAME_SOURCE_RUN && run.every((s) => s.article.sourceId === source)) {
      const other = rest.slice(0, RUN_LOOKAHEAD).findIndex((s) => s.article.sourceId !== source)
      if (other > 0) pick = other
    }
    out.push(...rest.splice(pick, 1))
  }
  return out
}

/**
 * A personal mix of the last two days, one report per story: stories in the user's interests
 * (earlier interests weigh more), about their province or region, like what they have been
 * reading (see `buildReadingProfile`), or widely covered; boosted by coverage and fading with
 * a 10-hour half-life. Stories the user already read (any report of them) sink to the end,
 * and one outlet never fills more than two slots in a row. `articles` must be newest first.
 */
export function rankForYou(
  articles: readonly Article[],
  settings: Pick<Settings, 'interests' | 'location'>,
  ctx: ForYouContext
): ForYouFeed {
  const { interests } = settings
  const weights = new Map(interests.map((c, i) => [c, 1 + (interests.length - i) / interests.length]))
  const { provinceCode, regionId } = settings.location
  const terms = new Map<string, ProfileTerm>()
  for (const term of ctx.profile?.terms ?? []) for (const stem of term.stems) terms.set(stem, term)
  const topics = ctx.profile?.topics

  // A story is read once any of its reports is.
  const readStories = new Set<string>()
  for (const article of articles) {
    if (ctx.now - article.publishedAt > FOR_YOU_WINDOW) break
    if (ctx.readIds.has(article.id)) readStories.add(storyKey(article))
  }

  const seen = new Set<string>()
  const unread: Scored[] = []
  const read: Scored[] = []
  for (const article of articles) {
    const age = Math.max(0, ctx.now - article.publishedAt)
    if (age > FOR_YOU_WINDOW) break
    const key = storyKey(article)
    if (seen.has(key)) continue

    let interest = 0
    let interestTopic: CategoryId | undefined
    let habit = 0
    let habitTopic: CategoryId | undefined
    for (const c of article.categories) {
      const weight = weights.get(c) ?? 0
      if (weight > interest) [interest, interestTopic] = [weight, c]
      const share = topics?.get(c) ?? 0
      if (share > habit) [habit, habitTopic] = [share, c]
    }
    const local =
      provinceCode && article.provinces.includes(provinceCode)
        ? 1.5
        : regionId && article.regions.includes(regionId)
          ? 0.75
          : 0
    let similar = 0
    let word: ProfileTerm | undefined
    if (terms.size > 0) {
      /** The profile stems each term matched. */
      const matched = new Map<ProfileTerm, Set<string>>()
      for (const stem of headlineStems(article.title)) {
        // A four-letter word's stem is the whole word: "zeka" also finds "zekâda", "zekaya".
        const key = terms.has(stem) ? stem : stem.slice(0, 4)
        const term = terms.get(key)
        if (!term) continue
        const found = matched.get(term)
        if (found) found.add(key)
        else matched.set(term, new Set([key]))
      }
      for (const [term, found] of matched) {
        // "Yavaş" alone is not "Mansur Yavaş": a term of several words needs two of them.
        if (found.size < Math.min(2, term.stems.length)) continue
        similar += term.weight * SIMILAR_WEIGHT
        if (!word || term.weight > word.weight) word = term
      }
      similar = Math.min(SIMILAR_MAX, similar)
    }
    const cluster = article.clusterId ? ctx.clustersById.get(article.clusterId) : undefined
    const sources = cluster ? cluster.sourceIds.length : 1
    if (interest === 0 && local === 0 && similar < SIMILAR && habit < HABIT && sources < 3) continue
    seen.add(key)

    const reason: ForYouReason =
      word && similar >= SIMILAR
        ? { kind: 'reads', word: word.word }
        : local > 0
          ? { kind: 'local', scope: local > 1 ? 'province' : 'region' }
          : interestTopic
            ? { kind: 'interest', category: interestTopic }
            : habitTopic && habit >= HABIT
              ? { kind: 'habit', category: habitTopic }
              : { kind: 'popular', sources }
    const base =
      interest +
      local +
      similar +
      habit * 1.2 +
      Math.log2(1 + sources) * 0.8 +
      (article.isHeadline ? 0.5 : 0) +
      (isBreakingNews(article) ? 0.4 : 0)
    const decay = 0.5 ** (age / (10 * HOUR))
    const scored = { article, score: base * decay, reason, term: word, similar: similar * decay }
    ;(readStories.has(key) ? read : unread).push(scored)
  }

  const byScore = (a: Scored, b: Scored): number => b.score - a.score
  spreadTerms(unread.sort(byScore))
  const ranked = [...spreadSources(unread.sort(byScore)), ...read.sort(byScore)]
  return {
    articles: ranked.map((s) => s.article),
    reasons: new Map(ranked.map((s) => [s.article.id, s.reason]))
  }
}
