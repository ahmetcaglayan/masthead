import DOMPurify, { type Config } from 'dompurify'
import type { ReaderContent } from '@shared/types'
import { foldText } from '@/lib/fold'
import { readingMinutes } from '@/lib/format'
import { httpSrcset, httpUrl } from './urls'

const words = (list: string): string[] => list.split(/\s+/).filter(Boolean)

/**
 * Reader mode keeps article markup only. Anything else is unwrapped (its text
 * kept) or, for scripts, styles, embeds and forms, dropped with its contents.
 */
const CONFIG: Config = {
  ALLOWED_TAGS: words(`
    p h1 h2 h3 h4 h5 h6 ul ol li dl dt dd blockquote q cite figure figcaption picture source img a
    strong em b i u s sub sup small mark abbr time code pre br hr
    table caption thead tbody tfoot tr th td div section span`),
  ALLOWED_ATTR: words('href src srcset sizes media alt title width height colspan rowspan datetime'),
  FORBID_TAGS: words('style script iframe frame object embed form input button textarea select svg math'),
  FORBID_ATTR: words('style class id'),
  ADD_FORBID_CONTENTS: words('form button select textarea object embed canvas dialog'),
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  KEEP_CONTENT: true
}

/** A dedicated instance, so these hooks never leak into other DOMPurify users. */
const purifier = DOMPurify(window)

purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName === 'A') {
    const href = httpUrl(node.getAttribute('href'))
    if (!href) {
      node.removeAttribute('href')
      return
    }
    node.setAttribute('href', href)
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  } else if (node.nodeName === 'IMG' || node.nodeName === 'SOURCE') {
    const src = httpUrl(node.getAttribute('src'))
    if (src) node.setAttribute('src', src)
    else node.removeAttribute('src')
    // DOMPurify's own URI check passes relative and protocol-relative values (`//host/x.jpg`
    // loads from file://host/, a network share, in the packaged app), and only looks at the first candidate.
    const srcset = httpSrcset(node.getAttribute('srcset'))
    if (srcset) node.setAttribute('srcset', srcset)
    else node.removeAttribute('srcset')
    if (node.nodeName === 'IMG') {
      node.setAttribute('loading', 'lazy')
      node.setAttribute('decoding', 'async')
      node.setAttribute('referrerpolicy', 'no-referrer')
    }
  }
})

/** A Reader-mode article, ready to render. */
export interface PreparedArticle {
  /** Sanitised body HTML. */
  html: string
  /** Lead image to show above the body; undefined when the body already opens with it or another picture. */
  lead?: string
  minutes: number
  /**
   * Whether the standfirst passed in should show: false when the body opens
   * with a fuller version of it (a shorter copy is dropped from the body instead).
   */
  standfirst: boolean
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function imageSource(img: Element): string {
  return img.getAttribute('src') ?? img.getAttribute('srcset')?.trim().split(/\s+/)[0] ?? ''
}

const textOf = (el: Element): string => (el.textContent ?? '').trim()
const runText = (run: Node[]): string =>
  run
    .map((node) => node.textContent ?? '')
    .join('')
    .trim()
const hasContent = (run: Node[]): boolean =>
  runText(run) !== '' || run.some((node) => node.nodeName === 'IMG')

/** Elements that stand on their own in the article flow (pictures included). */
const BLOCKS = new Set(
  words('P DIV SECTION UL OL DL TABLE FIGURE PICTURE IMG BLOCKQUOTE PRE HR H1 H2 H3 H4 H5 H6')
)
const BLOCK_SELECTOR = [...BLOCKS].join(', ').toLowerCase()
/** A run of text this long between line breaks reads as a paragraph of its own. */
const PARAGRAPH_MIN_CHARS = 60

function paragraphOf(doc: Document, nodes: Node[]): HTMLParagraphElement {
  const paragraph = doc.createElement('p')
  paragraph.append(...nodes)
  return paragraph
}

/**
 * Give the body a flat flow of blocks so every paragraph gets the same spacing:
 * containers holding blocks are unwrapped, text-only containers become
 * paragraphs, and loose text between blocks is gathered into paragraphs.
 */
function flatten(body: HTMLElement): void {
  const doc = body.ownerDocument
  for (const box of body.querySelectorAll('div, section')) {
    if (box.querySelector(BLOCK_SELECTOR)) box.replaceWith(...box.childNodes)
    else box.replaceWith(paragraphOf(doc, [...box.childNodes]))
  }
  const flow: Node[] = []
  let run: Node[] = []
  const flush = (): void => {
    if (hasContent(run)) flow.push(paragraphOf(doc, run))
    run = []
  }
  for (const node of [...body.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCKS.has(node.nodeName)) {
      flush()
      flow.push(node)
    } else {
      run.push(node)
    }
  }
  flush()
  body.replaceChildren(...flow)
}

/**
 * Many Turkish news sites separate paragraphs with single `<br>`s. Where a
 * paragraph holds at least two paragraph-sized runs between breaks, give each
 * run its own `<p>`.
 */
function splitLineBreakParagraphs(body: HTMLElement): void {
  for (const block of body.querySelectorAll('p')) {
    if (!block.querySelector(':scope > br')) continue
    const runs: Node[][] = [[]]
    for (const node of [...block.childNodes]) {
      if (node.nodeName === 'BR') runs.push([])
      else runs[runs.length - 1].push(node)
    }
    const filled = runs.filter(hasContent)
    if (filled.filter((run) => runText(run).length >= PARAGRAPH_MIN_CHARS).length < 2) continue
    block.replaceWith(...filled.map((run) => paragraphOf(block.ownerDocument, run)))
  }
}

/** Publisher boilerplate such as "Kaynak: Cnnturk.com" as a paragraph of its own. */
const SOURCE_LINE = /^(kaynak|source)\s*:?\s*[\p{L}\p{N}.\- ]{2,40}$/iu

/** Drop a source line at the start or the end of the body. */
function dropSourceLines(body: HTMLElement): void {
  for (const edge of [body.firstElementChild, body.lastElementChild]) {
    if (edge?.nodeName === 'P' && SOURCE_LINE.test(textOf(edge))) edge.remove()
  }
}

/** Folded text for comparing openings, trailing stops ignored. */
const comparable = (text: string): string => foldText(text).replace(/[\s.…]+$/, '')

/**
 * Settle a standfirst (the feed summary's first paragraph, shown under the
 * headline) against the body's opening paragraph: when one opens with the
 * other, a body copy no longer than the standfirst is dropped; a fuller one
 * stays and the standfirst is not shown. Returns whether it is shown.
 */
function settleStandfirst(body: HTMLElement, standfirst: string): boolean {
  const first = [...body.children].find((el) => el.nodeName === 'P')
  if (!first) return true
  const lede = comparable(standfirst)
  const opening = comparable(textOf(first))
  const key = Math.min(120, lede.length, opening.length)
  if (key < 40 || lede.slice(0, key) !== opening.slice(0, key)) return true
  if (opening.length <= lede.length + 20) {
    first.remove()
    return true
  }
  return false
}

/**
 * Fit the publisher's headings under the article's own title (an h1): the highest of them
 * reads as level 2 to assistive technology, the rest follow, while each keeps the look of
 * its tag (a publisher's h3 stays the size of an h3).
 */
function outlineHeadings(body: HTMLElement): void {
  const headings = [...body.querySelectorAll('h1, h2, h3, h4, h5, h6')]
  if (headings.length === 0) return
  const levelOf = (el: Element): number => Number(el.nodeName[1])
  const top = Math.min(...headings.map(levelOf))
  if (top === 2) return
  for (const heading of headings)
    heading.setAttribute('aria-level', String(Math.min(6, levelOf(heading) - top + 2)))
}

/** An image, a figure, or a block holding nothing but a picture. */
function isPicture(el: Element): boolean {
  if (el.nodeName === 'IMG' || el.nodeName === 'PICTURE') return true
  if (!el.querySelector('img')) return false
  return el.nodeName === 'FIGURE' || textOf(el) === ''
}

/**
 * Sanitise extracted article HTML for Reader mode (allowlisted tags, http(s)-only
 * links and images, links marked to open elsewhere) and tidy it: drop tracking
 * pixels and broken images, flatten the markup into evenly spaced paragraphs,
 * remove empty blocks and "Kaynak: …" lines, fit the publisher's headings under the title, settle the `standfirst` against
 * the opening paragraph, and decide whether a separate lead image is needed.
 */
export function prepareArticle(
  content: ReaderContent,
  fallbackImage?: string,
  standfirst?: string
): PreparedArticle {
  const body = purifier.sanitize(content.html, { ...CONFIG, RETURN_DOM: true }) as HTMLElement

  for (const img of body.querySelectorAll('img')) {
    const pixel = Number(img.getAttribute('width')) <= 2 && Number(img.getAttribute('height')) <= 2
    const sized = img.hasAttribute('width') && img.hasAttribute('height')
    const sourced = img.parentElement?.nodeName === 'PICTURE' && img.parentElement.querySelector('source')
    if ((!imageSource(img) && !sourced) || (sized && pixel)) img.remove()
  }
  flatten(body)
  splitLineBreakParagraphs(body)
  for (const el of body.querySelectorAll('p, span, figure, picture, li, blockquote')) {
    if (textOf(el) === '' && !el.querySelector('img')) el.remove()
  }
  dropSourceLines(body)
  outlineHeadings(body)
  const showStandfirst = standfirst ? settleStandfirst(body, standfirst) : false

  const candidate = content.image ?? fallbackImage
  const opensWithPicture = [...body.children].slice(0, 2).some(isPicture)
  const inBody =
    candidate !== undefined &&
    [...body.querySelectorAll('img')].some((img) => pathOf(imageSource(img)) === pathOf(candidate))

  return {
    html: body.innerHTML,
    lead: candidate && !opensWithPicture && !inBody ? candidate : undefined,
    minutes: readingMinutes(content.textLength || textOf(body).length),
    standfirst: showStandfirst
  }
}
