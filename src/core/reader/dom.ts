/**
 * The slice of the DOM the reader works with. linkedom's typings lean on lib.dom,
 * which the Node build does not load, so parsed documents are viewed through these.
 */
import { parseHTML } from 'linkedom'

export interface DomAttr {
  readonly name: string
  readonly value: string
}

export interface DomList extends ArrayLike<DomElement>, Iterable<DomElement> {}

/** Any node: element, text or comment. */
export interface DomNode {
  readonly nodeType: number
  readonly childNodes: ArrayLike<DomNode>
  remove(): void
}

export interface DomElement extends DomNode {
  readonly tagName: string
  readonly textContent: string | null
  readonly innerHTML: string
  readonly attributes: ArrayLike<DomAttr>
  readonly parentElement: DomElement | null
  readonly nextElementSibling: DomElement | null
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
  querySelector(selectors: string): DomElement | null
  querySelectorAll(selectors: string): DomList
  contains(other: DomElement): boolean
  prepend(...nodes: DomElement[]): void
  remove(): void
}

export interface DomDocument {
  readonly documentElement: DomElement
  readonly head: DomElement | null
  readonly body: DomElement | null
  createElement(tagName: string): DomElement
  querySelector(selectors: string): DomElement | null
  querySelectorAll(selectors: string): DomList
}

/** Parse an already-decoded HTML string. */
export function parseDocument(html: string): DomDocument {
  const document = parseHTML(withBody(html)).document as unknown as DomDocument
  // Browsers lower-case tag names in HTML documents; linkedom keeps Readability's `DIV` as written.
  const createElement = document.createElement.bind(document)
  document.createElement = (tagName) => createElement(tagName.toLowerCase())
  return document
}

/**
 * linkedom is not a spec tree builder: without an explicit <body> it nests content in odd
 * places (or builds no root at all), so give such documents the skeleton a browser would.
 */
function withBody(html: string): string {
  if (/<body[\s>]/i.test(html)) return html
  const head = /<head[\s>][\s\S]*?<\/head\s*>/i.exec(html)?.[0] ?? ''
  const body = html.replace(head, '').replace(/<!doctype[^>]*>|<\/?html[^>]*>/gi, '')
  const headContent = head.replace(/^<head[^>]*>|<\/head\s*>$/gi, '')
  return `<!doctype html><html><head>${headContent}</head><body>${body}</body></html>`
}
