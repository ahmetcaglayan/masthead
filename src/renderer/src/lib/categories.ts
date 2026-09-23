import type { TFunction } from 'i18next'
import {
  Car,
  Clapperboard,
  Coffee,
  Cpu,
  Flag,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  Leaf,
  MapPin,
  Newspaper,
  Palette,
  PenLine,
  Plane,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon
} from 'lucide-react'
import type { CategoryId } from '@shared/categories'
import type { CountryCode } from '@shared/types'

/** One icon per unified category, used in the sidebar, chips and section heads. */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  top: Newspaper,
  breaking: Zap,
  general: Layers,
  national: Flag,
  world: Globe,
  politics: Landmark,
  economy: TrendingUp,
  sports: Trophy,
  technology: Cpu,
  science: FlaskConical,
  health: HeartPulse,
  culture: Palette,
  entertainment: Clapperboard,
  lifestyle: Coffee,
  education: GraduationCap,
  automotive: Car,
  travel: Plane,
  environment: Leaf,
  local: MapPin,
  opinion: PenLine
}

/**
 * Localised category name. A country-specific label wins when one exists
 * (`category.national_tr` → "Türkiye"), otherwise `category.<id>` is used —
 * this is i18next's context lookup, so any `t` (any namespace) works.
 */
export function categoryLabel(t: TFunction, id: CategoryId, country?: CountryCode): string {
  return t(`common:category.${id}`, { context: country })
}
