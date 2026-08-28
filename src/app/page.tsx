import { Suspense } from 'react';
import NotionService from 'src/app/services/notion';
import Concerts from '#/src/app/components/concerts';
// export { metadata } from './metadata';
import Background from 'src/app/components/background';
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
        <div className="pointer-events-none flex min-h-screen flex-col items-center justify-center px-4 pt-24">
          <div className="flex flex-col items-center gap-5">
            <h1 className="font-['Ayer Poster'] my-6 text-center text-[20vw] font-bold leading-[25vw] tracking-wider  text-white lg:text-[12vw] lg:leading-[13vw]">
              BLUES CAVALIERS
            </h1>
            {/* only the video + concerts/links stay interactive; the rest lets
                pointer events fall through to the 3D vinyls behind */}
            {/* raised above the foreground vinyl canvas (z-10 in layout) so the
                video and concerts stay clickable while vinyls spin behind them */}
            <div className="relative z-20 flex justify-center gap-4 max-lg:flex-wrap">
              <iframe
                className="shadow-50/30 pointer-events-auto max-w-[400px] rounded-xl border-4 border-white shadow-lg"
                width="100%"
                height="232"
                src="https://www.youtube.com/embed/Ln6ss_0vOoY"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <Suspense fallback={<div>...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <Concerts promise={concerts} />
              </Suspense>
            </div>
          </div>
        </div>
        {/* raised above the foreground vinyl canvas so the text stays
            readable and its links stay clickable */}
        <div className="pointer-events-auto relative z-20 mx-auto mb-16 max-w-3xl px-4">
          <AboutBand />
        </div>
      </div>
    </>
  );
}
