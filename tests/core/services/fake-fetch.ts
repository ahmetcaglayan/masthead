export type Handler = (url: URL) => unknown

/** A fetch that answers JSON from `routes` by host (undefined → 404) and records every URL asked for. */
export function fakeFetch(routes: Record<string, Handler>): { fetch: typeof fetch; calls: string[] } {
  const calls: string[] = []
  const impl = (input: string | URL | Request): Promise<Response> => {
    const url = new URL(String(input))
    calls.push(url.toString())
    const body = routes[url.host]?.(url)
    return Promise.resolve(
      body === undefined
        ? new Response('not found', { status: 404 })
        : new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
    )
  }
  return { fetch: impl as typeof fetch, calls }
}

export const silentLogger = { info: () => {}, warn: () => {}, error: () => {} }
