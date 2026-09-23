import { useMemo } from 'react'
import { Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { PageHeader } from '@/components/news/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLibrary } from '@/stores/library'

/** Saved stories, most recently saved first. */
export function SavedPage(): React.JSX.Element {
  const { t } = useTranslation('news')
  const saved = useLibrary((s) => s.library.saved)
  const articles = useMemo(
    () => [...saved].sort((a, b) => b.savedAt - a.savedAt).map((entry) => entry.article),
    [saved]
  )

  return (
    <Page measure="4xl">
      <PageHeader
        kicker={t('common:nav.library')}
        icon={Bookmark}
        title={t('saved.title')}
        description={t('saved.description')}
        count={articles.length}
      />
      {articles.length > 0 ? (
        <ArticleFeed articles={articles} layout="list" dimRead={false} showProvince />
      ) : (
        <EmptyState icon={Bookmark} title={t('saved.emptyTitle')} description={t('saved.emptyBody')} />
      )}
    </Page>
  )
}
