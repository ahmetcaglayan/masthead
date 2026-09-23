import { useMemo } from 'react'
import { ExternalLink, Rss, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { META_CATEGORIES, type CategoryId } from '@shared/categories'
import type { Article, SourceDef } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { FilterBar, type FilterControl } from '@/components/news/FilterBar'
import { NoMatches } from '@/components/news/NewsGate'
import { useFilteredArticles } from '@/components/news/useFilteredArticles'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { Switch } from '@/components/ui/Switch'
import { setSourcesEnabled, useSources } from '@/hooks/useSources'
import { api } from '@/lib/api'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { domain, formatNumber } from '@/lib/format'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

/** The page fixes the source itself. */
const HIDE: readonly FilterControl[] = ['sources']

const NONE: readonly Article[] = []

const setEnabled = (id: string, on: boolean): void => void setSourcesEnabled([id], on)

function SourceHeader({ source, count }: { source: SourceDef; count: number }): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const { isEnabled } = useSources()
  const enabled = isEnabled(source.id)
  const topics = useMemo(
    () => [...new Set(source.feeds.map((f) => f.category))].filter((c) => !META_CATEGORIES.includes(c)),
    [source]
  )
  const switchId = `source-switch-${source.id}`

  return (
    <header className="mb-10 flex flex-wrap items-start gap-6 rounded-panel border border-line bg-surface p-6 shadow-soft sm:p-8">
      <SourceLogo source={source} size="xl" labelled />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{t(`common:sourceKind.${source.kind}`)}</Badge>
          {!enabled && <Badge variant="breaking">{t('source.offBadge')}</Badge>}
        </div>
        <h1 className="headline mt-2 text-4xl leading-tight font-semibold text-fg in-data-[density=compact]:text-3xl">
          {source.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[13.5px] text-fg-muted">
          <button
            type="button"
            onClick={() => void api.reader.openExternal(source.homepage)}
            className="inline-flex items-center gap-1 rounded-md font-medium text-fg transition-colors duration-150 hover:text-accent"
          >
            {domain(source.homepage)}
            <ExternalLink size={13} strokeWidth={1.75} aria-hidden />
          </button>
          <span aria-hidden className="text-fg-subtle">
            ·
          </span>
          <span>{t('source.feeds', { count: source.feeds.length })}</span>
          <span aria-hidden className="text-fg-subtle">
            ·
          </span>
          <span>{t('header.stories', { count, formatted: formatNumber(count, i18n.language) })}</span>
        </p>
        {topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topics.map((id: CategoryId) => (
              <Chip
                key={id}
                icon={CATEGORY_ICONS[id]}
                onClick={() => useUi.getState().navigate({ name: 'category', id })}
              >
                {categoryLabel(t, id, country)}
              </Chip>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 rounded-full bg-muted py-1.5 pr-1.5 pl-4">
        <label htmlFor={switchId} className="font-ui text-[13px] font-medium text-fg">
          {enabled ? t('source.on') : t('source.off')}
        </label>
        <Switch id={switchId} checked={enabled} onCheckedChange={(on) => setEnabled(source.id, on)} />
      </div>
    </header>
  )
}

/** One outlet: its logo, site, topics and on/off switch, then its stories with filters. */
export function SourcePage({ id }: { id: string }): React.JSX.Element {
  const { t } = useTranslation('news')
  const { byId, isEnabled } = useSources()
  const source = byId.get(id)
  // Indexed per snapshot, newest first; includes the source's stories while it is switched off.
  const own = useNews((s) => s.index.bySource.get(id)) ?? NONE
  const { articles, resetKey } = useFilteredArticles(own, HIDE)

  if (!source) {
    return (
      <Page>
        <EmptyState
          icon={SearchX}
          title={t('source.unknownTitle')}
          description={t('source.unknownBody')}
          action={
            <Button variant="primary" onClick={() => useUi.getState().navigate({ name: 'sources' })}>
              {t('gate.manageSources')}
            </Button>
          }
        />
      </Page>
    )
  }

  return (
    <Page>
      <SourceHeader source={source} count={own.length} />
      {!isEnabled(id) ? (
        <EmptyState
          icon={Rss}
          title={t('source.disabledTitle', { name: source.name })}
          description={t('source.disabledBody')}
          action={
            <Button variant="primary" onClick={() => setEnabled(id, true)}>
              {t('source.turnOn')}
            </Button>
          }
        />
      ) : own.length === 0 ? (
        <EmptyState icon={Rss} title={t('source.emptyTitle')} description={t('source.emptyBody')} />
      ) : (
        <>
          <FilterBar hide={HIDE} count={articles.length} />
          {articles.length > 0 ? (
            <ArticleFeed articles={articles} resetKey={resetKey} showProvince className="mt-10" />
          ) : (
            <NoMatches />
          )}
        </>
      )}
    </Page>
  )
}
