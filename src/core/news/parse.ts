/**
 * Feed parsing: RSS 2.0, RSS 1.0 (RDF) and Atom 1.0 into raw items, keeping every
 * image hint Turkish feeds use. Markup fields are read raw (stop nodes) so mixed
 * content — Dünya's `<img>` element followed by CDATA text — survives intact.
 * Never throws: failures come back as `error` with no items.
 */
import { XMLParser } from 'fast-xml-parser'
import { htmlImages, type ImageCandidate } from './images'
import { collapseWhitespace, decodeEntities, htmlToText } from './text'

/** One feed entry before normalisation. Missing fields are empty strings. */
export interface RawItem {
  /** Plain text, entities decoded. */
  title: string
  link: string
  guid: string
  descriptionHtml: string
  /** Full body: content:encoded, Atom content, or Hürriyet's `<text>`. */
  contentHtml: string
  /** Date string as published (pubDate | published | updated | dc:date). */
  published: string
  author: string
  categories: string[]
  imageCandidates: ImageCandidate[]
}

export interface ParsedFeed {
  title?: string
  items: RawItem[]
  error?: string
}

type XmlValue = string | XmlNode | XmlValue[] | undefined
interface XmlNode {
  [key: string]: XmlValue
}

const ARRAY_TAGS = new Set([
  'item',
  'entry',
  'link',
  'category',
  'subcategory',
  'dc:subject',
  'enclosure',
  'media:content',
  'media:thumbnail',
  'media:group',
  'atom:link'
])
const MARKUP_TAGS = ['title', 'description', 'content:encoded', 'content', 'summary', 'text', 'subtitle']

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  parseAttributeValue: false,
  processEntities: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  stopNodes: MARKUP_TAGS.map((tag) => `*.${tag}`),
  isArray: (name, _path, _isLeaf, isAttribute) => !isAttribute && ARRAY_TAGS.has(name)
})

/** Custom per-item image tags seen in Turkish feeds (AA, CNN Türk, Mynet, TRT, Star…). */
const CUSTOM_IMAGE_TAGS = new Set([
  'image',
  'img',
  'resim',
  'ipimage',
  'thumbnail',
  'thumb',
  'picture',
  'imageurl',
  'image_url',
  'mainimage'
])
const IMAGE_EXTENSION = /\.(?:jpe?g|png|gif|webp|avif)(?:[?#]|$)/i
const VIDEO_URL = /youtube\.com|youtu\.be|vimeo\.com|\.(?:mp4|m3u8|webm|mov|mp3)(?:[?#]|$)/i

const list = (value: XmlValue): XmlValue[] =>
  Array.isArray(value) ? value : value === undefined ? [] : [value]
const first = (value: XmlValue): XmlValue => list(value)[0]
const isNode = (value: XmlValue): value is XmlNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Text content of a plain element, entities decoded and whitespace collapsed. */
function textOf(value: XmlValue): string {
  const v = first(value)
  if (typeof v === 'string') return collapseWhitespace(decodeEntities(v))
  return isNode(v) ? textOf(v['#text']) : ''
}

function attr(value: XmlValue, name: string): string {
  const v = first(value)
  const raw = isNode(v) ? v[`@_${name}`] : undefined
  return typeof raw === 'string' ? decodeEntities(raw).trim() : ''
}

function positiveInt(value: string): number | undefined {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/**
 * HTML carried by a markup element (kept raw by the parser): CDATA sections are
 * taken literally, everything else is XML-unescaped once.
 */
function markupOf(value: XmlValue): string {
  const v = first(value)
  const raw = typeof v === 'string' ? v : isNode(v) && typeof v['#text'] === 'string' ? v['#text'] : ''
  let html = ''
  let index = 0
  for (;;) {
    const start = raw.indexOf('<![CDATA[', index)
    if (start < 0) {
      html += decodeEntities(raw.slice(index))
      break
    }
    html += decodeEntities(raw.slice(index, start))
    const end = raw.indexOf(']]>', start + 9)
    if (end < 0) {
      html += raw.slice(start + 9)
      break
    }
    html += raw.slice(start + 9, end)
    index = end + 3
  }
  return html.trim()
}

function rssLink(node: XmlNode): string {
  for (const link of list(node.link)) {
    const href = typeof link === 'string' ? textOf(link) : attr(link, 'href') || textOf(link)
    if (href) return href
  }
  for (const link of list(node['atom:link'])) {
    const rel = attr(link, 'rel')
    const href = attr(link, 'href')
    if (href && (!rel || rel === 'alternate')) return href
  }
  return attr(node, 'rdf:about')
}

function atomLink(node: XmlNode): string {
  let fallback = ''
  for (const link of list(node.link)) {
    const href = attr(link, 'href') || textOf(link)
    const rel = attr(link, 'rel') || 'alternate'
    if (!href) continue
    if (rel === 'alternate') return href
    if (!fallback && rel !== 'self' && rel !== 'enclosure' && rel !== 'replies') fallback = href
  }
  return fallback
}

function authorOf(node: XmlNode): string {
  const creator = textOf(node['dc:creator'])
  if (creator) return creator
  const author = first(node.author)
  return isNode(author) && author.name !== undefined ? textOf(author.name) : textOf(author)
}

function categoriesOf(node: XmlNode): string[] {
  const values = [...list(node.category), ...list(node.subcategory), ...list(node['dc:subject'])]
    .map((value) => attr(value, 'label') || textOf(value) || attr(value, 'term'))
    .filter((value) => value && value.length <= 60)
  return [...new Set(values)]
}

function customImageUrl(value: XmlValue): string {
  if (typeof value === 'string') {
    const text = textOf(value)
    return /<img/i.test(text) ? (htmlImages(text)[0]?.url ?? '') : text
  }
  if (!isNode(value)) return ''
  return attr(value, 'url') || attr(value, 'src') || attr(value, 'href') || textOf(value.url) || textOf(value)
}

function addMedia(node: XmlNode, out: ImageCandidate[]): void {
  for (const media of list(node['media:content'])) {
    const url = attr(media, 'url')
    const medium = attr(media, 'medium')
    const type = attr(media, 'type')
    const isImage = medium ? medium === 'image' : type ? type.startsWith('image/') : !VIDEO_URL.test(url)
    if (url && isImage) {
      out.push({
        url,
        type: type || undefined,
        width: positiveInt(attr(media, 'width')),
        source: 'media:content'
      })
    }
    if (isNode(media)) addThumbnails(media, out)
  }
  addThumbnails(node, out)
}

function addThumbnails(node: XmlNode, out: ImageCandidate[]): void {
  for (const thumbnail of list(node['media:thumbnail'])) {
    const url = attr(thumbnail, 'url')
    if (url) out.push({ url, width: positiveInt(attr(thumbnail, 'width')), source: 'media:thumbnail' })
  }
}

function imagesOf(node: XmlNode, html: string[], atomLinks = false): ImageCandidate[] {
  const out: ImageCandidate[] = []
  for (const enclosure of list(node.enclosure)) {
    const url = attr(enclosure, 'url')
    const type = attr(enclosure, 'type')
    if (url && (type ? type.startsWith('image/') : IMAGE_EXTENSION.test(url))) {
      out.push({
        url,
        type: type || undefined,
        width: positiveInt(attr(enclosure, 'width')),
        source: 'enclosure'
      })
    }
  }
  if (atomLinks) {
    for (const link of list(node.link)) {
      const url = attr(link, 'href')
      if (url && attr(link, 'rel') === 'enclosure' && attr(link, 'type').startsWith('image/')) {
        out.push({ url, type: attr(link, 'type'), source: 'enclosure' })
      }
    }
  }
  addMedia(node, out)
  for (const group of list(node['media:group'])) if (isNode(group)) addMedia(group, out)
  const itunes = attr(node['itunes:image'], 'href')
  if (itunes) out.push({ url: itunes, source: 'itunes:image' })
  for (const key of Object.keys(node)) {
    const name = key.toLowerCase()
    const sized = /^img(\d{2,4})x\d{2,4}$/.exec(name)
    if (!sized && !CUSTOM_IMAGE_TAGS.has(name)) continue
    for (const value of list(node[key])) {
      const url = customImageUrl(value)
      if (url) out.push({ url, width: sized ? Number(sized[1]) : undefined, source: 'image' })
    }
  }
  for (const fragment of html) {
    for (const image of htmlImages(fragment)) out.push({ ...image, source: 'html' })
  }
  return out
}

function rssItem(node: XmlNode): RawItem {
  const descriptionHtml = markupOf(node.description)
  const contentHtml = markupOf(node['content:encoded']) || markupOf(node.text) || markupOf(node.content)
  const guid = textOf(node.guid)
  const link = rssLink(node) || (/^https?:\/\//i.test(guid) ? guid : '')
  return {
    title: htmlToText(markupOf(node.title)),
    link,
    guid,
    descriptionHtml,
    contentHtml,
    published:
      textOf(node.pubDate) || textOf(node['dc:date']) || textOf(node.published) || textOf(node.updated),
    author: authorOf(node),
    categories: categoriesOf(node),
    imageCandidates: imagesOf(node, [descriptionHtml, contentHtml])
  }
}

function atomEntry(node: XmlNode): RawItem {
  const descriptionHtml = markupOf(node.summary)
  const contentHtml = markupOf(node.content)
  return {
    title: htmlToText(markupOf(node.title)),
    link: atomLink(node),
    guid: textOf(node.id),
    descriptionHtml,
    contentHtml,
    published:
      textOf(node.published) || textOf(node.updated) || textOf(node.issued) || textOf(node['dc:date']),
    author: authorOf(node),
    categories: categoriesOf(node),
    imageCandidates: imagesOf(node, [descriptionHtml, contentHtml], true)
  }
}

function collect(nodes: XmlValue[], read: (node: XmlNode) => RawItem): RawItem[] {
  const items: RawItem[] = []
  for (const node of nodes) {
    if (!isNode(node)) continue
    try {
      items.push(read(node))
    } catch {
      // One malformed entry must not cost the rest of the feed.
    }
  }
  return items
}

/** Name of the document element, skipping the prolog, comments and doctype. */
function rootElement(text: string): string | undefined {
  return /<(?![?!])([A-Za-z_][\w:.-]*)/.exec(text.slice(0, 8192))?.[1]
}

/** Parse an RSS 2.0, RSS 1.0 (RDF) or Atom document. Never throws. */
export function parseFeed(xml: string): ParsedFeed {
  const text = (xml.charCodeAt(0) === 0xfeff ? xml.slice(1) : xml).trimStart()
  const root = rootElement(text)
  if (!root) return { items: [], error: 'not a feed (empty document)' }
  const rootName = root.toLowerCase()
  if (rootName !== 'rss' && rootName !== 'feed' && rootName !== 'rdf:rdf') {
    return { items: [], error: `not a feed (<${root}> document)` }
  }

  let doc: XmlNode
  try {
    doc = parser.parse(text) as XmlNode
  } catch (error) {
    return { items: [], error: `invalid XML: ${error instanceof Error ? error.message : String(error)}` }
  }
  const top = first(doc[root])
  if (!isNode(top)) return { items: [], error: 'not a feed (no channel)' }

  if (rootName === 'feed') {
    return { title: htmlToText(markupOf(top.title)) || undefined, items: collect(list(top.entry), atomEntry) }
  }
  const channel = first(top.channel)
  const nodes = [...list(top.item), ...(isNode(channel) ? list(channel.item) : [])]
  const title = isNode(channel) ? htmlToText(markupOf(channel.title)) : ''
  return { title: title || undefined, items: collect(nodes, rssItem) }
}
