import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Vandaag'
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays} dagen geleden`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`
  return formatDate(dateString)
}

export const categoryLabels: Record<string, string> = {
  ziekte: 'Ziekte',
  familie: 'Familie',
  werk: 'Werk',
  geestelijk_leven: 'Geestelijk leven',
  algemeen: 'Algemeen',
}

export const statusLabels: Record<string, string> = {
  open: 'Open',
  in_gebed: 'In gebed',
  beantwoord: 'Beantwoord',
  gearchiveerd: 'Gearchiveerd',
}

export const priorityLabels: Record<string, string> = {
  urgent: 'Urgent',
  normaal: 'Normaal',
  laag: 'Laag',
}
