import { cn } from '@/lib/cn'
import { sectionElementId, type SettingsSectionId } from './sections'

export interface SettingsSectionProps {
  id: SettingsSectionId
  title: React.ReactNode
  description?: React.ReactNode
  /** Right-aligned next to the title (e.g. a reset button). */
  action?: React.ReactNode
  children: React.ReactNode
}

/** A titled block of the settings page; the sub-navigation scrolls to it by id. */
export function SettingsSection({
  id,
  title,
  description,
  action,
  children
}: SettingsSectionProps): React.JSX.Element {
  const titleId = `${sectionElementId(id)}-title`
  return (
    <section id={sectionElementId(id)} aria-labelledby={titleId} className="scroll-mt-8">
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <h2 id={titleId} className="headline text-2xl leading-tight font-semibold text-fg">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-fg-muted text-pretty">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  )
}

/** Rounded panel holding setting rows separated by hairlines. */
export function SettingsCard({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      className={cn(
        'divide-y divide-line rounded-panel border border-line bg-surface shadow-soft',
        className
      )}
      {...props}
    />
  )
}

export interface SettingRowProps {
  label: React.ReactNode
  description?: React.ReactNode
  /** Control on the right of the label. */
  control?: React.ReactNode
  /** Full-width content below the label (cards, previews). */
  children?: React.ReactNode
  /** Id of the control the label is for (switches), so clicking the label toggles it. */
  htmlFor?: string
  /** Id for the label text, for controls that reference it with aria-labelledby. */
  labelId?: string
  className?: string
}

/** One setting: label and description on the left, its control on the right or below. */
export function SettingRow({
  label,
  description,
  control,
  children,
  htmlFor,
  labelId,
  className
}: SettingRowProps): React.JSX.Element {
  const labelClass = 'block text-[15px] leading-snug font-medium text-fg'
  return (
    <div className={cn('px-6 py-5 in-data-[density=compact]:px-5 in-data-[density=compact]:py-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          {htmlFor ? (
            <label id={labelId} htmlFor={htmlFor} className={labelClass}>
              {label}
            </label>
          ) : (
            <div id={labelId} className={labelClass}>
              {label}
            </div>
          )}
          {description && (
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted text-pretty">{description}</p>
          )}
        </div>
        {control && <div className="flex shrink-0 items-center gap-2">{control}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
