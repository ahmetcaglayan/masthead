import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/Dialog'
import { Kbd } from '@/components/ui/Kbd'
import { useUi } from '@/stores/ui'

/** Each row: the label key and its combos (alternatives shown side by side). */
const GROUPS: readonly { title: string; rows: readonly [label: string, combos: readonly string[]][] }[] = [
  {
    title: 'shortcuts.general',
    rows: [
      ['shortcuts.palette', ['Mod+K']],
      ['shortcuts.search', ['/']],
      ['shortcuts.refresh', ['R', 'Mod+R']],
      ['shortcuts.back', ['Alt+ArrowLeft']],
      ['shortcuts.settings', ['Mod+,']],
      ['shortcuts.help', ['?']]
    ]
  },
  {
    title: 'shortcuts.reading',
    rows: [
      ['shortcuts.next', ['J']],
      ['shortcuts.previous', ['K']],
      ['shortcuts.open', ['O', 'Enter']],
      ['shortcuts.save', ['S']]
    ]
  },
  {
    title: 'shortcuts.reader',
    rows: [
      ['shortcuts.readerStep', ['Alt+ArrowLeft', 'Alt+ArrowRight']],
      ['shortcuts.readerMode', ['Alt+R']],
      ['shortcuts.close', ['Esc']]
    ]
  }
]

/** `?`: every keyboard shortcut, grouped. */
export function ShortcutsDialog(): React.JSX.Element {
  const { t } = useTranslation('common')
  const open = useUi((s) => s.shortcutsOpen)
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => useUi.getState().setShortcutsOpen(next)}
      title={t('shortcuts.title')}
      size="md"
    >
      <div className="flex flex-col gap-6">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
              {t(group.title)}
            </h3>
            <dl className="divide-y divide-line">
              {group.rows.map(([label, combos]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2">
                  <dt className="font-ui text-[14px] text-fg">{t(label)}</dt>
                  <dd className="flex shrink-0 items-center gap-2">
                    {combos.map((combo, i) => (
                      <Fragment key={combo}>
                        {i > 0 && (
                          <span className="font-ui text-[12px] text-fg-subtle">{t('shortcuts.or')}</span>
                        )}
                        <Kbd combo={combo} />
                      </Fragment>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
