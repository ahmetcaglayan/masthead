import { DropdownMenu } from 'radix-ui'
import { Check, ChevronRight, type LucideIcon } from 'lucide-react'
import { hotkeyParts } from '@/lib/hotkeys'
import { cn } from '@/lib/cn'
import './ui.css'

/** Dropdown menu root (Radix `DropdownMenu.Root`): `open`, `onOpenChange`, `modal`. */
export const Menu = DropdownMenu.Root
/** Wrap the trigger element: `<MenuTrigger asChild><Button …/></MenuTrigger>`. */
export const MenuTrigger = DropdownMenu.Trigger
export const MenuGroup = DropdownMenu.Group
export const MenuRadioGroup = DropdownMenu.RadioGroup
export const MenuSub = DropdownMenu.Sub

const PANEL =
  'mh-float z-50 min-w-48 overflow-hidden rounded-card border border-line bg-surface p-1.5 font-ui text-sm text-fg shadow-float outline-none'

const ITEM =
  'relative flex h-8 cursor-default items-center gap-2.5 rounded-lg px-2.5 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-muted'

export type MenuContentProps = React.ComponentProps<typeof DropdownMenu.Content>

/** The floating panel, portalled. Defaults: `align="end"`, `sideOffset={6}`. */
export function MenuContent({
  className,
  align = 'end',
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: MenuContentProps): React.JSX.Element {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(PANEL, className)}
        {...props}
      />
    </DropdownMenu.Portal>
  )
}

function Shortcut({ combo }: { combo: string }): React.JSX.Element {
  return (
    <span className="ml-auto pl-4 text-xs tracking-wide text-fg-subtle">{hotkeyParts(combo).join(' ')}</span>
  )
}

export interface MenuItemProps extends React.ComponentProps<typeof DropdownMenu.Item> {
  icon?: LucideIcon
  /** Shortcut hint on the right, e.g. `Mod+S`. */
  shortcut?: string
  /** Destructive action styling. */
  danger?: boolean
}

/** An action row. Use `onSelect` for the action. */
export function MenuItem({
  icon: Icon,
  shortcut,
  danger,
  className,
  children,
  ...props
}: MenuItemProps): React.JSX.Element {
  return (
    <DropdownMenu.Item
      className={cn(ITEM, danger && 'text-breaking data-[highlighted]:bg-breaking-soft', className)}
      {...props}
    >
      {Icon && (
        <Icon size={16} strokeWidth={1.75} aria-hidden className={danger ? undefined : 'text-fg-muted'} />
      )}
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut && <Shortcut combo={shortcut} />}
    </DropdownMenu.Item>
  )
}

export interface MenuCheckboxItemProps extends React.ComponentProps<typeof DropdownMenu.CheckboxItem> {
  icon?: LucideIcon
}

/** A toggle row with a check mark. Keeps the menu open when toggled unless `onSelect` says otherwise. */
export function MenuCheckboxItem({
  icon: Icon,
  className,
  children,
  onSelect,
  ...props
}: MenuCheckboxItemProps): React.JSX.Element {
  return (
    <DropdownMenu.CheckboxItem
      className={cn(ITEM, 'pr-8', className)}
      onSelect={onSelect ?? ((e) => e.preventDefault())}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />}
      <span className="min-w-0 flex-1">{children}</span>
      <DropdownMenu.ItemIndicator className="absolute right-2.5 text-accent-ink">
        <Check size={15} strokeWidth={2.25} aria-hidden />
      </DropdownMenu.ItemIndicator>
    </DropdownMenu.CheckboxItem>
  )
}

export interface MenuRadioItemProps extends React.ComponentProps<typeof DropdownMenu.RadioItem> {
  icon?: LucideIcon
}

/** A single-choice row inside `MenuRadioGroup` (`value` + `onValueChange`). */
export function MenuRadioItem({
  icon: Icon,
  className,
  children,
  ...props
}: MenuRadioItemProps): React.JSX.Element {
  return (
    <DropdownMenu.RadioItem className={cn(ITEM, 'pr-8', className)} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />}
      <span className="min-w-0 flex-1">{children}</span>
      <DropdownMenu.ItemIndicator className="absolute right-2.5 text-accent-ink">
        <Check size={15} strokeWidth={2.25} aria-hidden />
      </DropdownMenu.ItemIndicator>
    </DropdownMenu.RadioItem>
  )
}

/** Kicker-style group heading. */
export function MenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Label>): React.JSX.Element {
  return (
    <DropdownMenu.Label
      className={cn(
        'px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase',
        className
      )}
      {...props}
    />
  )
}

export function MenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Separator>): React.JSX.Element {
  return <DropdownMenu.Separator className={cn('mx-1 my-1.5 h-px bg-line', className)} {...props} />
}

export interface MenuSubTriggerProps extends React.ComponentProps<typeof DropdownMenu.SubTrigger> {
  icon?: LucideIcon
}

/** Row that opens a nested `MenuSubContent`. */
export function MenuSubTrigger({
  icon: Icon,
  className,
  children,
  ...props
}: MenuSubTriggerProps): React.JSX.Element {
  return (
    <DropdownMenu.SubTrigger className={cn(ITEM, 'data-[state=open]:bg-muted', className)} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />}
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronRight size={15} strokeWidth={1.75} aria-hidden className="text-fg-subtle" />
    </DropdownMenu.SubTrigger>
  )
}

export function MenuSubContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenu.SubContent>): React.JSX.Element {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent sideOffset={sideOffset} className={cn(PANEL, className)} {...props} />
    </DropdownMenu.Portal>
  )
}
