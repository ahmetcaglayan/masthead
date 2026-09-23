import { Slider as RSlider } from 'radix-ui'
import { cn } from '@/lib/cn'

export interface SliderProps {
  value: number
  onValueChange: (value: number) => void
  /** Fires once when the user releases the thumb (persist here). */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  'aria-label'?: string
  /** Screen-reader text for the current value, e.g. "110%". */
  valueText?: string
  className?: string
}

/** Single-thumb slider (Radix). */
export function Slider({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  valueText,
  className,
  ...aria
}: SliderProps): React.JSX.Element {
  return (
    <RSlider.Root
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      onValueCommit={onValueCommit && (([v]) => onValueCommit(v))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'relative flex h-5 w-full touch-none items-center select-none data-[disabled]:opacity-45',
        className
      )}
    >
      <RSlider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-subtle">
        <RSlider.Range className="absolute h-full rounded-full bg-accent" />
      </RSlider.Track>
      <RSlider.Thumb
        aria-label={aria['aria-label']}
        aria-valuetext={valueText}
        className="block size-[18px] rounded-full border border-line-strong bg-surface shadow-card transition-transform duration-150 ease-out hover:scale-110 focus-visible:scale-110 dark:bg-fg"
      />
    </RSlider.Root>
  )
}
