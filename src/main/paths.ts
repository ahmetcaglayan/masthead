/**
 * Folder under userData for the news, image and ad block caches. Not `cache`:
 * Windows paths are case-insensitive, so that would be Chromium's own HTTP
 * `Cache` folder, which Chromium may clear or lock.
 */
export const APP_CACHE_DIR = 'news-cache'
