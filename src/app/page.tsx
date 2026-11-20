import { Suspense } from 'react';
import { ChevronDown } from '#/src/app/components/icons';
import NotionService from 'src/app/services/notion';
import Concerts from '#/src/app/components/concerts';
import AboutBand from '#/src/app/components/about';

// re-fetch Notion concerts hourly instead of freezing them at build time
export const revalidate = 3600;

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

async function getData() {
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
    .filter((concert: Record<string, string>) => concert.name);
}

export default async function Page() {
  const concerts = await getData();

  return (
    <>
      <div className="text-gray-300">
        {/* desktop: the first screen is left to the video; concerts come right
            after the "Desliza" hint. Phones keep them on the first screen */}
        <div aria-hidden className="pointer-events-none h-[100svh] max-lg:hidden" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[calc(100svh-11rem)] flex flex-col items-center gap-1 text-xs font-bold uppercase tracking-widest text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.8)]"
        >
          Desliza
          <ChevronDown className="h-6 w-6 drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.8)] motion-safe:animate-bounce" />
        </div>
        {/* target of the "Saltar al contenido" skip link */}
        <div id="contenido" className="scroll-mt-28">
          <div className="pointer-events-auto relative z-20 mx-auto flex max-w-3xl justify-center px-4 max-lg:min-h-[100svh] max-lg:items-center max-lg:pt-24 lg:mb-10">
            <Suspense fallback={null}>
              {/* @ts-expect-error Async Server Component */}
              <Concerts promise={concerts} />
            </Suspense>
          </div>
          <div className="pointer-events-auto relative z-20 mx-auto mb-40 max-w-3xl px-4">
            <AboutBand />
          </div>
        </div>
      </div>
    </>
  );
}
