/** Public, provider-neutral event slugs. */
export function eventSlug(title, date) {
  const base = String(title || 'event')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  const d = new Date(date);
  const day = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  return day ? `${base}-${day}` : base;
}
