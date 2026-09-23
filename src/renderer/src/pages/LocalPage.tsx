import { useDeferredValue, useMemo } from 'react'
import { MapPin, MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article, SourceDef } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { ArticleCard } from '@/components/news/ArticleCard'
import { ArticleFeed } from '@/components/news/ArticleFeed'
import { FilterBar, FilterSummary, type FilterControl } from '@/components/news/FilterBar'
import { LocationPicker, type LocationValue } from '@/components/news/LocationPicker'
import { NewsGate, NoMatches } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { useFilteredArticles } from '@/components/news/useFilteredArticles'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useLocalUnit, useSelectedProvince, useSources } from '@/hooks/useSources'
import { storyFor, storyKey, topStories } from '@/lib/curation'
import { activeFilterCount } from '@/lib/filter'
import { onePerStory, storySources } from '@/lib/story'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

/** The page fixes the location itself. */
const HIDE: readonly FilterControl[] = ['location']
/** Stories from the rest of the region shown under a quiet province. */
const REGION_EXTRA = 12
/** A place needs this many stories before it gets a lead story and runners-up. */
const LEAD_MIN = 6
const NONE: readonly Article[] = []

const saveLocation = (location: LocationValue): void => void useSettings.getState().update({ location })

/** First visit: choose a province (regions open into their provinces). */
function ChooseCity(): React.JSX.Element {
  const { t } = useTranslation('news')
  const context = useLocalUnit()
  return (
    <>
      <PageHeader
        kicker={t('local.kicker')}
        icon={MapPin}
        title={t('local.title')}
        description={t('local.chooseBody', { context })}
      />
      <div className="max-w-2xl rounded-panel border border-line bg-surface p-5 shadow-soft sm:p-6">
        <LocationPicker
          value={{ provinceCode: null, regionId: null }}
          onChange={saveLocation}
          allowRegion={false}
          spacious
          autoFocus
        />
      </div>
    </>
  )
}

function ChangeCity(): React.JSX.Element {
  const { t } = useTranslation('news')
  const context = useLocalUnit()
  const location = useSettings((s) => s.settings.location)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" icon={MapPinned}>
          {t('local.change', { context })}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-3">
        <LocationPicker value={location} onChange={saveLocation} autoFocus />
      </PopoverContent>
    </Popover>
  )
}

/** Local outlets for the place: city pages of national sites and local newspapers. */
function LocalSources({ sources }: { sources: readonly SourceDef[] }): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <section aria-labelledby="local-sources" className="mb-8">
      <h2
        id="local-sources"
        className="mb-3 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
      >
        {t('local.sources')}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <li key={source.id}>
            <button
              type="button"
              onClick={() => useUi.getState().navigate({ name: 'source', id: source.id })}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface pr-3.5 pl-1.5 font-ui text-[13px] font-medium text-fg shadow-soft transition-colors duration-150 hover:border-line-strong hover:bg-muted"
            >
              <SourceLogo source={source} size="sm" />
              {source.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function LocalNews(): React.JSX.Element {
  const { t } = useTranslation('news')
  const regionSetting = useSettings((s) => s.settings.location.regionId)
  const province = useSelectedProvince()
  const unit = useLocalUnit()
  const regionId = province?.region ?? regionSetting
  const regionName = regionId ? t(`common:region.${regionId}`) : ''
  const { sources } = useSources()
  const view = useDeferredValue(useNewsView())
  // The five-minute re-rank happens in the background, like a refresh.
  const now = useDeferredValue(useNow(5 * 60_000))
  // With filters set, the list starts at the top: the lead block would ignore them.
  const filtering = useUi((s) => activeFilterCount({ ...s.filters, provinceCode: null, regionId: null }) > 0)

  const local =
    (province ? view.byProvince.get(province.code) : regionId ? view.byRegion.get(regionId) : undefined) ??
    NONE
  // The city's own front: its strongest stories by how many outlets filed them here.
  const leads = useMemo(() => (local.length >= LEAD_MIN ? topStories(local, now, 4) : []), [local, now])
  const inPlace = storySources(local)
  const hero = useMemo(() => (leads[0] ? storyFor(leads[0], view) : undefined), [leads, view])
  const leadQueue = useMemo(() => leads.map((a) => a.id), [leads])
  // One card per story (its newest report), without the ones leading the page.
  const rest = useMemo(() => {
    const shown = new Set(filtering ? [] : leads.map(storyKey))
    return onePerStory(local.filter((a) => !shown.has(storyKey(a))))
  }, [local, leads, filtering])
  const { articles, resetKey } = useFilteredArticles(rest, HIDE)
  const nearby = useMemo(() => {
    if (!province || !regionId || local.length >= 20) return NONE
    const inRegion = view.byRegion.get(regionId) ?? NONE
    const extra: Article[] = []
    for (const a of inRegion) {
      if (extra.length >= REGION_EXTRA) break
      if (!a.provinces.includes(province.code)) extra.push(a)
    }
    return extra
  }, [view, local, province, regionId])
  const localSources = useMemo(
    () =>
      province
        ? sources.filter(
            (s) =>
              s.kind === 'local' &&
              (s.provinces?.includes(province.code) || s.feeds.some((f) => f.province === province.code))
          )
        : [],
    [sources, province]
  )

  return (
    <>
      <PageHeader
        kicker={province ? regionName : t('local.kicker')}
        icon={MapPin}
        title={province?.name ?? regionName}
        description={
          province
            ? t('local.description', { city: province.name })
            : t('local.regionDescription', { context: unit })
        }
        count={local.length}
        showUpdated
        actions={
          <>
            <FilterSummary hide={HIDE} />
            <ChangeCity />
          </>
        }
      />
      {hero && !filtering && (
        <section
          aria-label={t('local.top', { place: province?.name ?? regionName })}
          className="mb-12 grid gap-x-10 gap-y-10 lg:grid-cols-3"
        >
          <ArticleCard
            article={hero.lead}
            variant="hero"
            related={hero.related}
            sourceCount={inPlace.get(storyKey(hero.lead))}
            updatedAt={hero.updatedAt}
            queue={leadQueue}
            priority
            className="lg:col-span-2"
          />
          {leads.length > 1 && (
            <ul className="flex flex-col divide-y divide-line">
              {leads.slice(1).map((article) => (
                <li key={article.id} className="py-5 first:pt-0 in-data-[density=compact]:py-4">
                  <ArticleCard
                    article={article}
                    variant="compact"
                    sourceCount={inPlace.get(storyKey(article))}
                    updatedAt={
                      article.clusterId ? view.clustersById.get(article.clusterId)?.updatedAt : undefined
                    }
                    queue={leadQueue}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {localSources.length > 0 && <LocalSources sources={localSources} />}
      <FilterBar hide={HIDE} count={articles.length} />
      {articles.length > 0 ? (
        <ArticleFeed articles={articles} resetKey={resetKey} className="mt-10" />
      ) : local.length > 0 ? (
        <NoMatches />
      ) : (
        <EmptyState
          icon={MapPin}
          title={t('local.emptyTitle', { place: province?.name ?? regionName })}
          description={t('local.emptyBody')}
        />
      )}
      {nearby.length > 0 && (
        <section aria-labelledby="local-nearby" className="mt-16">
          <SectionHeader
            id="local-nearby"
            title={t('local.nearby', { region: regionName })}
            icon={MapPinned}
            className="mb-6"
          />
          <ArticleFeed articles={nearby} layout="grid" showProvince />
        </section>
      )}
    </>
  )
}

/** "Yerel": news about the user's province (or region) and its local outlets; asks for a city first. */
export function LocalPage(): React.JSX.Element {
  const chosen = useSettings((s) => Boolean(s.settings.location.provinceCode || s.settings.location.regionId))
  return (
    <Page>
      {chosen ? (
        <NewsGate>
          <LocalNews />
        </NewsGate>
      ) : (
        <ChooseCity />
      )}
    </Page>
  )
}
