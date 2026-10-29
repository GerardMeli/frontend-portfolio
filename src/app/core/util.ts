import { API_URL } from './config';

/** Identifiant d'ancre d'une section (SKILL -> skill, CUSTOM_X -> custom-x). */
export function anchorOf(type: string): string {
  return type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function scrollToAnchor(event: Event, id: string): void {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** "https://github.com/x/" devient "github.com/x". */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : on ignore */
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Formate une date ISO (yyyy-MM-dd) selon le format du marché : "MM/yyyy", "MMM yyyy" ou "yyyy". */
export function formatDate(iso: string | undefined, pattern: string, lang: string): string {
  if (!iso) return '';
  const [year, month] = iso.split('-').map(Number);
  if (!year) return '';
  const m = month || 1;
  switch (pattern) {
    case 'yyyy':
      return String(year);
    case 'MMM yyyy':
      return capitalize(
        new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      );
    default:
      return `${String(m).padStart(2, '0')}/${year}`;
  }
}

export function formatPeriod(
  start: string | undefined,
  end: string | undefined,
  current: boolean,
  pattern: string,
  lang: string,
  presentLabel: string,
): string {
  const from = formatDate(start, pattern, lang);
  const to = current ? presentLabel : formatDate(end, pattern, lang);
  return from && to ? `${from} – ${to}` : from || to;
}

/** Date complète lisible (ex. 15 janvier 1998). */
export function formatFullDate(iso: string | undefined, lang: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year) return '';
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1)).toLocaleDateString(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Les images servies par le backend ont une URL relative (/api/public/photo?v=...) : on y ajoute l'adresse du backend. */
export function mediaUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith('/') ? new URL(API_URL).origin + url : url;
}