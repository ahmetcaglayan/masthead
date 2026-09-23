import { useId, useMemo, useState } from 'react'
import { Pencil, Plus, RotateCcw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCountryPack } from '@shared/countries'
import {
  ASSET_KINDS,
  CRYPTOS,
  CURRENCIES,
  MAX_WATCHLIST,
  METALS,
  cleanWatchlist,
  cryptoItem,
  currencyItem,
  equityItem,
  marketsCountry,
  metalItem,
  suggestedEquities,
  type AssetKind,
  type WatchItem
} from '@shared/markets'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { IconButton } from '@/components/ui/IconButton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAssetName, useWatchlist } from '@/features/markets/hooks'
import { localeFor } from '@/i18n'
import { useSettings } from '@/stores/settings'
import { SettingsCard, SettingsSection } from './SettingsLayout'

const INPUT =
  'selectable h-9 min-w-0 rounded-full border border-line bg-canvas px-4 font-ui text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-line-strong focus:bg-surface focus:ring-3 focus:ring-accent-soft'

const save = (list: readonly WatchItem[] | null): void =>
  void useSettings.getState().update({ markets: { watchlist: list === null ? null : cleanWatchlist(list) } })

/** "dolar*, USD" ↔ ["dolar*", "USD"]. */
const splitWords = (text: string): string[] =>
  text
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)

/** One watched item: its name, the words its news is found by (editable), and a remove button. */
function ItemRow({ item, list }: { item: WatchItem; list: readonly WatchItem[] }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const name = useAssetName()(item)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputId = useId()
  const replace = (next: WatchItem): void => save(list.map((other) => (other.id === item.id ? next : other)))

  return (
    <li className="px-6 py-3 in-data-[density=compact]:px-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-ui text-[14px] font-medium text-fg">
            {name}
            {item.code !== name && (
              <span className="ml-2 text-[12px] font-normal text-fg-subtle">{item.code}</span>
            )}
          </p>
          {!editing && (
            <p className="truncate font-ui text-[12px] text-fg-subtle">{item.keywords.join(', ')}</p>
          )}
        </div>
        <IconButton
          size="sm"
          icon={Pencil}
          label={t('markets.editWords', { name })}
          aria-expanded={editing}
          pressed={editing}
          onClick={() => {
            setDraft(item.keywords.join(', '))
            setEditing(!editing)
          }}
        />
        <IconButton
          size="sm"
          icon={X}
          label={t('markets.remove', { name })}
          onClick={() => save(list.filter((other) => other.id !== item.id))}
        />
      </div>
      {editing && (
        <form
          className="mt-2 flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            replace({ ...item, keywords: splitWords(draft) })
            setEditing(false)
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            {t('markets.words')}
          </label>
          <input
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            className={`${INPUT} flex-1 basis-64`}
          />
          <Button type="submit" size="sm" variant="primary">
            {t('markets.saveWords')}
          </Button>
          <p className="basis-full font-ui text-[12px] leading-relaxed text-fg-subtle">
            {t('markets.wordsHint')}
          </p>
        </form>
      )}
    </li>
  )
}

/** A company or market to follow in the news: its name, an optional ticker and the words to look for. */
function CompanyForm({ onAdd }: { onAdd: (item: WatchItem) => void }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [words, setWords] = useState('')
  const ids = { name: useId(), ticker: useId(), words: useId() }
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        const clean = name.trim()
        if (!clean) return
        const keywords = splitWords(words)
        onAdd(equityItem(clean, keywords.length > 0 ? keywords : [clean], ticker.trim() || undefined))
        setName('')
        setTicker('')
        setWords('')
      }}
    >
      {(
        [
          ['name', name, setName, 'basis-48'],
          ['ticker', ticker, setTicker, 'basis-28'],
          ['words', words, setWords, 'basis-56']
        ] as const
      ).map(([field, value, set, basis]) => (
        <label key={field} htmlFor={ids[field]} className={`flex min-w-0 flex-1 flex-col gap-1 ${basis}`}>
          <span className="font-ui text-[12px] text-fg-muted">{t(`markets.company.${field}`)}</span>
          <input
            id={ids[field]}
            value={value}
            maxLength={60}
            onChange={(event) => set(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            className={INPUT}
          />
        </label>
      ))}
      <Button type="submit" variant="primary" icon={Plus} disabled={!name.trim()}>
        {t('markets.add')}
      </Button>
    </form>
  )
}

/** Adding to the watchlist: one kind at a time, from what is offered or (companies) your own. */
function AddPanel({ list, language }: { list: readonly WatchItem[]; language: string }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const country = useSettings((s) => s.settings.country)
  const [kind, setKind] = useState<AssetKind>('equity')
  const name = useAssetName()
  const local = marketsCountry(country)?.currency
  const have = new Set(list.map((item) => item.id))
  const full = list.length >= MAX_WATCHLIST
  const add = (item: WatchItem): void => {
    if (!full && !have.has(item.id)) save([...list, item])
  }

  const offered = useMemo((): WatchItem[] => {
    const names = new Intl.DisplayNames([localeFor(language)], { type: 'currency' })
    switch (kind) {
      case 'currency':
        return CURRENCIES.filter((code) => code !== local).map((code) =>
          currencyItem(code, language, names.of(code))
        )
      case 'metal':
        return METALS.map((code) => metalItem(code, language))
      case 'crypto':
        return CRYPTOS.map(({ code }) => cryptoItem(code, language))
      case 'equity':
        return suggestedEquities(country)
    }
  }, [kind, language, local, country])
  const available = offered.filter((item) => !have.has(item.id))

  return (
    <div className="flex flex-col gap-4 px-6 py-5 in-data-[density=compact]:px-5 in-data-[density=compact]:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-ui text-[14px] font-medium text-fg">{t('markets.addTitle')}</h3>
        <SegmentedControl<AssetKind>
          size="sm"
          aria-label={t('markets.addTitle')}
          value={kind}
          onChange={setKind}
          options={ASSET_KINDS.map((value) => ({ value, label: t(`markets.kinds.${value}`) }))}
        />
      </div>
      {full ? (
        <p className="font-ui text-[13px] text-fg-muted">{t('markets.full', { count: MAX_WATCHLIST })}</p>
      ) : (
        <>
          {available.length > 0 && (
            <ul aria-label={t('markets.offered')} className="flex flex-wrap gap-2">
              {available.map((item) => (
                <li key={item.id}>
                  <Chip icon={Plus} onClick={() => add(item)}>
                    {name(item)}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
          {kind === 'equity' && (
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <p className="font-ui text-[13px] text-fg-muted">{t('markets.company.hint')}</p>
              <CompanyForm onAdd={add} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Settings → Markets: the watchlist of the markets page, and adding to it. */
export function MarketsSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const country = useSettings((s) => s.settings.country)
  const customised = useSettings((s) => s.settings.markets.watchlist !== null)
  const list = useWatchlist()
  const language = getCountryPack(country)?.language ?? 'en'
  const groups = ASSET_KINDS.map((kind) => [kind, list.filter((item) => item.kind === kind)] as const).filter(
    ([, items]) => items.length > 0
  )

  return (
    <SettingsSection id="markets" title={t('nav.markets')} description={t('markets.description')}>
      <SettingsCard>
        {groups.length === 0 && (
          <p className="px-6 py-5 font-ui text-[13px] text-fg-muted">{t('markets.empty')}</p>
        )}
        {groups.map(([kind, items]) => (
          <section key={kind} aria-label={t(`markets.kinds.${kind}`)} className="py-2">
            <h3 className="px-6 pt-2 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase in-data-[density=compact]:px-5">
              {t(`markets.kinds.${kind}`)}
            </h3>
            <ul>
              {items.map((item) => (
                <ItemRow key={item.id} item={item} list={list} />
              ))}
            </ul>
          </section>
        ))}
        <AddPanel list={list} language={language} />
        {customised && (
          <div className="flex justify-end px-6 py-3 in-data-[density=compact]:px-5">
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => save(null)}>
              {t('markets.reset')}
            </Button>
          </div>
        )}
      </SettingsCard>
    </SettingsSection>
  )
}
