import NotionService from 'src/app/services/notion';

export interface Concert {
  name: string;
  date?: string;
  time?: string;
  price?: string;
  direction?: string;
  direction_link?: string;
  _isoDate?: string;
}

export const SITE_URL = 'https://www.bluescavaliers.com';
const TIME_ZONE = 'Europe/Madrid';
// Notion has no end time; assume a ~2h set for calendar entries
const SET_HOURS = 2;

// Notion column names/order aren't guaranteed to be English or exactly
// "name"/"date"/etc, so every property key is normalized and matched against
// these aliases instead of assuming an exact match.
const FIELD_ALIASES: Record<string, string[]> = {
  name: ['name', 'nombre', 'evento', 'concierto', 'titulo', 'título'],
  date: ['date', 'fecha'],
  time: ['time', 'hora'],
  price: ['price', 'precio'],
  direction: [
    'direction',
    'lugar',
    'direccion',
    'dirección',
    'ubicacion',
    'ubicación',
    'venue',
    'sala',
  ],
  direction_link: ['direction_link', 'enlace', 'link', 'url', 'mapa', 'maps'],
};

function normalizeKey(key: string) {
  return key.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

function fieldForKey(key: string) {
  const normalized = normalizeKey(key);
  return Object.entries(FIELD_ALIASES).find(([, aliases]) =>
    aliases.includes(normalized),
  )?.[0];
}

// The Notion "Fecha" column is a plain text field formatted as "DD/MM/YY"
// (Spanish display format), not a native Notion date property — so there's
// no `date`-typed property to read an ISO date from. Parse that display
// string too, otherwise every concert looks undated and none get filtered
// or sorted correctly.
function parseDisplayDate(value?: string): string | undefined {
  const match = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Notion property values are shaped differently per column type (title,
// rich_text, date, number, select, url, ...) — the previous version only
// understood rich_text, so a "Name" title column or a "Date"/"Price" column
// of the correct native type silently dropped every concert.
function getPropertyValue(prop: any): string | undefined {
  switch (prop?.type) {
    case 'title':
      return prop.title?.map((t: any) => t.plain_text).join('') || undefined;
    case 'rich_text':
      return (
        prop.rich_text?.map((t: any) => t.plain_text).join('') || undefined
      );
    case 'date':
      return prop.date?.start || undefined;
    case 'number':
      return prop.number != null ? String(prop.number) : undefined;
    case 'select':
      return prop.select?.name || undefined;
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name).join(', ') || undefined;
    case 'url':
      return prop.url || undefined;
    case 'email':
      return prop.email || undefined;
    case 'phone_number':
      return prop.phone_number || undefined;
    default:
      return undefined;
  }
}

async function fetchNotionConcerts(): Promise<Concert[]> {
  const notionService = new NotionService();
  const data = await notionService.getInfo();
  return data
    ?.map((properties: Record<string, any>) => {
      const concert: Record<string, string> = {};
      let titleValue: string | undefined;
      let isoDate: string | undefined;

      for (const [key, prop] of Object.entries(properties)) {
        const value = getPropertyValue(prop);
        if (value === undefined) continue;

        if (prop.type === 'title') titleValue = value;
        if (prop.type === 'date') isoDate = value;

        const field = fieldForKey(key);
        if (field) concert[field] = value;
      }

      // The database's title column is always the concert name, whatever
      // its column is actually called in Notion.
      if (!concert.name && titleValue) concert.name = titleValue;
      const resolvedIsoDate = isoDate ?? parseDisplayDate(concert.date);
      if (resolvedIsoDate) concert._isoDate = resolvedIsoDate;

      return concert;
    })
    .filter((concert: Record<string, string>) => concert.name) as unknown as Concert[];
}

// ---------------------------------------------------------------------------
// public API

/** Upcoming concerts (undated ones last), each with a stable URL-safe id. */
export async function getConcerts() {
  const today = new Date().toISOString().slice(0, 10);
  return ((await fetchNotionConcerts()) ?? [])
    .filter((concert) => !concert._isoDate || concert._isoDate >= today)
    .sort((a, b) =>
      (a._isoDate ?? '9999-12-31').localeCompare(b._isoDate ?? '9999-12-31'),
    )
    .map((concert) => ({ ...concert, id: concertId(concert) }));
}

export type UpcomingConcert = Awaited<ReturnType<typeof getConcerts>>[number];

function slug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function concertId(concert: Concert) {
  return slug(`${concert._isoDate ?? ''} ${concert.name}`);
}

/** "21:30", "21.30h", "9:30" → "21:30"; undefined if there's no clock time */
export function isoTime(time?: string) {
  const match = time?.match(/(\d{1,2})[:.h](\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : undefined;
}

/** "2026-12-12" or "2026-12-12T21:30" (Madrid local time), for <time> and schema.org */
export function localStart(concert: Concert) {
  if (!concert._isoDate) return undefined;
  const time = isoTime(concert.time);
  return time ? `${concert._isoDate}T${time}` : concert._isoDate;
}

// dates are calendar days, not instants: format them in UTC so the server's
// own timezone can never shift "12 de diciembre" to the 11th
function utcDate(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`);
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', ...opts });

/** "12 de diciembre de 2026" */
export const longDate = (iso: string) =>
  fmt({ day: 'numeric', month: 'long', year: 'numeric' }).format(utcDate(iso));
/** "sábado" */
export const weekday = (iso: string) => fmt({ weekday: 'long' }).format(utcDate(iso));
/** "dic" */
export const shortMonth = (iso: string) =>
  fmt({ month: 'short' }).format(utcDate(iso)).replace('.', '');
/** "diciembre de 2026" */
export const monthTitle = (iso: string) =>
  fmt({ month: 'long', year: 'numeric' }).format(utcDate(iso));

// ---------------------------------------------------------------------------
// calendar links

/** UTC offset of Madrid on that day ("+01:00" in winter, "+02:00" in summer) */
function madridOffset(isoDate: string) {
  const name = new Intl.DateTimeFormat('en', {
    timeZone: TIME_ZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(new Date(`${isoDate}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value;
  return name?.replace('GMT', '') || '+01:00';
}

/** start/end as real instants, or all-day dates when there's no time */
export function eventSpan(concert: Concert) {
  if (!concert._isoDate) return undefined;
  const time = isoTime(concert.time);
  if (!time) {
    const next = utcDate(concert._isoDate);
    next.setUTCDate(next.getUTCDate() + 1);
    return { allDay: true as const, start: concert._isoDate, end: next.toISOString().slice(0, 10) };
  }
  const start = new Date(`${concert._isoDate}T${time}:00${madridOffset(concert._isoDate)}`);
  const end = new Date(start.getTime() + SET_HOURS * 3600_000);
  return { allDay: false as const, start, end };
}

export function eventTitle(concert: Concert) {
  return `Blues Cavaliers · ${concert.name}`;
}

function eventDetails(concert: Concert) {
  return [
    concert.price && `Precio: ${concert.price}`,
    concert.direction_link,
    `${SITE_URL}/#conciertos`,
  ]
    .filter(Boolean)
    .join('\n');
}

const compact = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Google Calendar, Outlook.com and Office 365 "new event" links, plus our .ics */
export function calendarLinks(concert: UpcomingConcert) {
  const span = eventSpan(concert);
  if (!span) return undefined;
  const title = eventTitle(concert);
  const location = concert.direction ?? '';
  const details = eventDetails(concert);

  const google = new URL('https://calendar.google.com/calendar/render');
  google.searchParams.set('action', 'TEMPLATE');
  google.searchParams.set('text', title);
  google.searchParams.set(
    'dates',
    span.allDay
      ? `${span.start.replace(/-/g, '')}/${span.end.replace(/-/g, '')}`
      : `${compact(span.start)}/${compact(span.end)}`,
  );
  google.searchParams.set('details', details);
  google.searchParams.set('location', location);
  google.searchParams.set('ctz', TIME_ZONE);

  const outlook = (host: string) => {
    const url = new URL(`https://${host}/calendar/0/deeplink/compose`);
    url.searchParams.set('path', '/calendar/action/compose');
    url.searchParams.set('rru', 'addevent');
    url.searchParams.set('subject', title);
    url.searchParams.set('body', details);
    url.searchParams.set('location', location);
    url.searchParams.set('startdt', span.allDay ? span.start : span.start.toISOString());
    url.searchParams.set('enddt', span.allDay ? span.end : span.end.toISOString());
    if (span.allDay) url.searchParams.set('allday', 'true');
    return url.toString();
  };

  return {
    google: google.toString(),
    outlook: outlook('outlook.live.com'),
    office365: outlook('outlook.office.com'),
    ics: `/conciertos/${concert.id}.ics`,
  };
}

// RFC 5545 text: escape \ ; , and newlines, fold lines at 75 octets
function icsText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/[;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
}

function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ' ' + rest.slice(cut);
  }
  out.push(rest);
  return out.join('\r\n');
}

/** A one-event iCalendar file (Apple Calendar, Outlook desktop, Thunderbird…) */
export function icsFile(concert: UpcomingConcert) {
  const span = eventSpan(concert);
  if (!span) return undefined;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Blues Cavaliers//Conciertos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${concert.id}@bluescavaliers.com`,
    `DTSTAMP:${compact(new Date())}`,
    ...(span.allDay
      ? [
          `DTSTART;VALUE=DATE:${span.start.replace(/-/g, '')}`,
          `DTEND;VALUE=DATE:${span.end.replace(/-/g, '')}`,
        ]
      : [`DTSTART:${compact(span.start)}`, `DTEND:${compact(span.end)}`]),
    `SUMMARY:${icsText(eventTitle(concert))}`,
    concert.direction && `LOCATION:${icsText(concert.direction)}`,
    `DESCRIPTION:${icsText(eventDetails(concert))}`,
    `URL:${SITE_URL}/#conciertos`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[];
  return lines.map(fold).join('\r\n') + '\r\n';
}
