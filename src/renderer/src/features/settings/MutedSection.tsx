import { useId, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { foldText } from '@shared/fold'
import { MAX_MUTED_KEYWORDS, MAX_MUTED_LENGTH, cleanMutedKeywords, muteMatcherFor } from '@shared/mute'
import { Button } from '@/components/ui/Button'
import { useSources } from '@/hooks/useSources'
import { formatNumber } from '@/lib/format'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { SettingsCard, SettingsSection } from './SettingsLayout'

/** Stories from the enabled sources that the muted words hide right now. */
function useHiddenCount(keywords: readonly string[]): number {
  const index = useNews((s) => s.index)
  const { isEnabled } = useSources()
  return useMemo(() => {
    const isMuted = muteMatcherFor(keywords)
    if (!isMuted) return 0
    let hidden = 0
    for (const article of index.sorted) if (isEnabled(article.sourceId) && isMuted(article)) hidden++
    return hidden
  }, [index, isEnabled, keywords])
}

/** Settings → Muted words: stories mentioning any of them disappear from every page. */
export function MutedSection(): React.JSX.Element {
  const { t, i18n } = useTranslation('settings')
  const keywords = useSettings((s) => s.settings.muted.keywords)
  const [draft, setDraft] = useState('')
  const inputId = useId()
  const hintId = useId()
  const hidden = useHiddenCount(keywords)

  const save = (next: readonly string[]): void =>
    void useSettings.getState().update({ muted: { keywords: cleanMutedKeywords(next) } })

  const folded = foldText(draft.trim())
  const duplicate = folded !== '' && keywords.some((word) => foldText(word) === folded)
  const full = keywords.length >= MAX_MUTED_KEYWORDS
  const canAdd = folded !== '' && !duplicate && !full

  const add = (): void => {
    if (!canAdd) return
    save([...keywords, draft])
    setDraft('')
  }

  return (
    <SettingsSection id="muted" title={t('nav.muted')} description={t('muted.description')}>
      <SettingsCard className="flex flex-col gap-4 px-6 py-5 in-data-[density=compact]:px-5 in-data-[density=compact]:py-4">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            {t('muted.label')}
          </label>
          <input
            id={inputId}
            type="text"
            value={draft}
            maxLength={MAX_MUTED_LENGTH}
            placeholder={t('muted.placeholder')}
            aria-describedby={hintId}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
            className="selectable h-9 min-w-0 flex-1 basis-56 rounded-full border border-line bg-canvas px-4 font-ui text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-line-strong focus:bg-surface focus:ring-3 focus:ring-accent-soft"
          />
          <Button type="submit" variant="primary" icon={Plus} disabled={!canAdd}>
            {t('muted.add')}
          </Button>
        </form>
        <p id={hintId} className="font-ui text-[13px] leading-relaxed text-fg-subtle">
          {duplicate
            ? t('muted.duplicate')
            : full
              ? t('muted.full', { count: MAX_MUTED_KEYWORDS })
              : t('muted.hint')}
        </p>

        {keywords.length > 0 ? (
          <>
            <ul aria-label={t('muted.listLabel')} className="flex flex-wrap gap-2">
              {keywords.map((word) => (
                <li key={word}>
                  <span className="inline-flex h-8 items-center gap-1 rounded-full border border-line bg-muted pr-1 pl-3.5 font-ui text-[13px] text-fg">
                    {word}
                    <button
                      type="button"
                      aria-label={t('muted.remove', { word })}
                      onClick={() => save(keywords.filter((w) => w !== word))}
                      className="flex size-6 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-subtle hover:text-fg"
                    >
                      <X size={14} strokeWidth={2} aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p aria-live="polite" className="font-ui text-[13px] text-fg-muted tabular-nums">
                {t('muted.hidden', { count: hidden, formatted: formatNumber(hidden, i18n.language) })}
              </p>
              <Button size="sm" variant="ghost" onClick={() => save([])}>
                {t('muted.clear')}
              </Button>
            </div>
          </>
        ) : (
          <p className="font-ui text-[13px] text-fg-muted">{t('muted.empty')}</p>
        )}
      </SettingsCard>
    </SettingsSection>
  )
}
