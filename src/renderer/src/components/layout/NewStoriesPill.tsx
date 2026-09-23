import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { scrollMainToTop } from '@/hooks/useMainScroll'
import { useNews } from '@/stores/news'
import { useUi } from '@/stores/ui'
import { isNewsRoute } from './routing'

/**
 * Floating "12 new stories" pill at the top of the page area. Refreshes never
 * shift the page under the reader; this pill brings them to the top instead.
 */
export function NewStoriesPill(): React.JSX.Element {
  const { t } = useTranslation('common')
  const unseen = useNews((s) => s.unseen)
  const onNews = useUi((s) => isNewsRoute(s.route))
  const visible = unseen > 0 && onNews

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              scrollMainToTop('smooth')
              useNews.getState().acknowledge()
            }}
            className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full bg-accent pr-4 pl-3 font-ui text-[13px] font-semibold text-on-accent shadow-float transition-colors duration-150 hover:bg-accent-hover"
          >
            <ArrowUp size={16} strokeWidth={2} aria-hidden />
            {t('newStories', { count: unseen })}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
