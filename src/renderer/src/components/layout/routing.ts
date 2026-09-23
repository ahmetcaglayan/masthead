import type { Route } from '@/stores/ui'

/**
 * Identity of a route for transitions and scroll memory. Search and settings
 * keep one key across queries/sections so typing or switching sections does
 * not remount the page.
 */
export function routeKey(route: Route): string {
  switch (route.name) {
    case 'category':
    case 'source':
      return `${route.name}:${route.id}`
    default:
      return route.name
  }
}

/** Routes that show news (the "N new stories" pill only makes sense there). */
export function isNewsRoute(route: Route): boolean {
  return (
    route.name !== 'settings' &&
    route.name !== 'sources' &&
    route.name !== 'saved' &&
    route.name !== 'history'
  )
}
