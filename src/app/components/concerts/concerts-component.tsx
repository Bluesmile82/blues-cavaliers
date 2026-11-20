import {
  SITE_URL,
  UpcomingConcert,
  calendarLinks,
  isoTime,
  localStart,
  longDate,
  monthTitle,
  shortMonth,
  weekday,
} from '#/src/app/lib/concerts';
import {
  CalendarPlus,
  ChevronDown,
  Clock,
  MapPin,
  Ticket,
} from '#/src/app/components/icons';
import SubscribeForm from './subscribe-form';

const NEW_TAB = ' (se abre en una pestaña nueva)';
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// schema.org MusicEvent list, so search engines can show the dates as events
function eventsJsonLd(concerts: UpcomingConcert[]) {
  return concerts
    .filter((concert) => concert._isoDate)
    .map((concert) => {
      const price = concert.price?.replace(',', '.').match(/\d+(\.\d+)?/)?.[0];
      const free = /gratis|libre|free/i.test(concert.price ?? '');
      return {
        '@context': 'https://schema.org',
        '@type': 'MusicEvent',
        name: `Blues Cavaliers: ${concert.name}`,
        startDate: localStart(concert),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        url: `${SITE_URL}/#concierto-${concert.id}`,
        location: {
          '@type': 'Place',
          name: concert.direction ?? concert.name,
          address: concert.direction ?? concert.name,
          ...(concert.direction_link && { hasMap: concert.direction_link }),
        },
        performer: { '@type': 'MusicGroup', name: 'Blues Cavaliers', url: SITE_URL },
        organizer: { '@type': 'MusicGroup', name: 'Blues Cavaliers', url: SITE_URL },
        image: `${SITE_URL}/images/cavaliers-live.jpg`,
        ...((price || free) && {
          offers: {
            '@type': 'Offer',
            price: free ? '0' : price,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/#concierto-${concert.id}`,
          },
        }),
      };
    });
}

/** "sáb / 12 / dic" tile; "?" when Notion has no parseable date */
function DateBadge({ concert }: { concert: UpcomingConcert }) {
  const iso = concert._isoDate;
  return (
    <div
      aria-hidden
      className="flex w-16 shrink-0 flex-col items-center justify-center self-start rounded-lg bg-white px-2 py-2 text-background shadow-lg lg:w-20"
    >
      {iso ? (
        <>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {weekday(iso).slice(0, 3)}
          </span>
          <span className="font-['Ayer_Poster'] text-4xl leading-none lg:text-5xl">
            {Number(iso.slice(8, 10))}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {shortMonth(iso)}
          </span>
        </>
      ) : (
        <span className="font-['Ayer_Poster'] text-4xl leading-none">?</span>
      )}
    </div>
  );
}

/** Native <details> dropdown: works without JavaScript and with the keyboard */
function AddToCalendar({ concert }: { concert: UpcomingConcert }) {
  const links = calendarLinks(concert);
  if (!links) return null;
  const item =
    'flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-background/10 focus-visible:bg-background/10';
  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/60 transition hover:bg-white hover:text-background group-open:bg-white group-open:text-background [&::-webkit-details-marker]:hidden">
        <CalendarPlus aria-hidden className="h-4 w-4" />
        Añadir al calendario
        <span className="sr-only">: {concert.name}</span>
        <ChevronDown aria-hidden className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <ul className="absolute left-0 z-30 mt-2 w-60 overflow-hidden rounded-lg bg-white py-1 text-sm font-bold text-background shadow-2xl">
        <li>
          <a className={item} href={links.google} target="_blank" rel="noopener noreferrer">
            Google Calendar<span className="sr-only">{NEW_TAB}</span>
          </a>
        </li>
        <li>
          <a className={item} href={links.ics} download>
            Apple Calendar <span className="font-normal opacity-70">(.ics)</span>
          </a>
        </li>
        <li>
          <a className={item} href={links.outlook} target="_blank" rel="noopener noreferrer">
            Outlook.com<span className="sr-only">{NEW_TAB}</span>
          </a>
        </li>
        <li>
          <a className={item} href={links.office365} target="_blank" rel="noopener noreferrer">
            Outlook / Microsoft 365<span className="sr-only">{NEW_TAB}</span>
          </a>
        </li>
        <li>
          <a className={item} href={links.ics} download>
            Otros calendarios <span className="font-normal opacity-70">(.ics)</span>
          </a>
        </li>
      </ul>
    </details>
  );
}

function ConcertItem({ concert }: { concert: UpcomingConcert }) {
  const iso = concert._isoDate;
  const clock = isoTime(concert.time);
  const meta = 'flex items-center gap-1.5';
  return (
    <li
      id={`concierto-${concert.id}`}
      // grid so the calendar button can span the full card on phones
      className="grid scroll-mt-28 grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10 target:ring-2 target:ring-white lg:gap-x-5 lg:p-5"
    >
      <DateBadge concert={concert} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-tight text-white lg:text-xl">
          {concert.name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-100 lg:text-base">
          <p className={meta}>
            {iso ? (
              <time dateTime={localStart(concert)}>
                {capitalize(weekday(iso))}, {longDate(iso)}
              </time>
            ) : (
              concert.date ?? 'Fecha por confirmar'
            )}
          </p>
          {concert.time && (
            <p className={meta}>
              <Clock aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
              <span className="sr-only">Hora:</span>
              {clock ? `${clock} h` : concert.time}
            </p>
          )}
          {concert.direction && (
            <p className={meta}>
              <MapPin aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
              <span className="sr-only">Lugar:</span>
              {concert.direction_link ? (
                <a
                  className="underline underline-offset-2 hover:text-white"
                  href={concert.direction_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {concert.direction}
                  <span className="sr-only"> (mapa, se abre en una pestaña nueva)</span>
                </a>
              ) : (
                concert.direction
              )}
            </p>
          )}
          {concert.price && (
            <p className={meta}>
              <Ticket aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
              <span className="sr-only">Precio:</span>
              {concert.price}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-2 mt-3 sm:col-span-1 sm:col-start-2">
        <AddToCalendar concert={concert} />
      </div>
    </li>
  );
}

const WEEKDAYS = [
  ['L', 'lunes'],
  ['M', 'martes'],
  ['X', 'miércoles'],
  ['J', 'jueves'],
  ['V', 'viernes'],
  ['S', 'sábado'],
  ['D', 'domingo'],
];

/** One month, Monday first, concert days linking to their entry in the list */
function MonthCalendar({ month, concerts }: { month: string; concerts: UpcomingConcert[] }) {
  const [year, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const today = new Date().toISOString().slice(0, 10);
  const byDay = new Map<number, UpcomingConcert[]>();
  for (const concert of concerts) {
    const day = Number(concert._isoDate!.slice(8, 10));
    byDay.set(day, [...(byDay.get(day) ?? []), concert]);
  }
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <table className="w-full table-fixed border-separate border-spacing-0.5 text-center text-sm">
      <caption className="mb-2 text-left text-base font-bold text-white">
        {capitalize(monthTitle(`${month}-01`))}
      </caption>
      <thead>
        <tr>
          {WEEKDAYS.map(([short, full]) => (
            <th key={full} scope="col" className="pb-1 text-xs font-bold text-gray-300">
              <abbr title={full} className="no-underline">
                {short}
              </abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, w) => (
          <tr key={w}>
            {week.map((day, d) => {
              if (!day) return <td key={d} />;
              const iso = `${month}-${String(day).padStart(2, '0')}`;
              const marked = byDay.get(day);
              const isToday = iso === today;
              return (
                <td key={d} className="p-0">
                  {marked ? (
                    <a
                      href={`#concierto-${marked[0].id}`}
                      aria-label={`${longDate(iso)}: ${marked.map((c) => c.name).join(', ')}`}
                      className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-background shadow transition hover:scale-110"
                    >
                      {day}
                    </a>
                  ) : (
                    <span
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                        isToday ? 'text-white ring-1 ring-white/60' : 'text-gray-300'
                      }`}
                      {...(isToday && { 'aria-current': 'date' as const })}
                    >
                      {day}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function Concerts({ promise }: { promise: Promise<UpcomingConcert[]> }) {
  const concerts = (await promise) ?? [];
  const jsonLd = eventsJsonLd(concerts);
  // months that have concerts, soonest first (at most three)
  const months = Array.from(
    new Set(concerts.flatMap((c) => (c._isoDate ? [c._isoDate.slice(0, 7)] : []))),
  ).slice(0, 3);

  return (
    // the navbar's "Conciertos" link targets this; scroll-mt clears the fixed header
    <section
      id="conciertos"
      aria-labelledby="conciertos-titulo"
      className="w-full scroll-mt-28 rounded-2xl bg-background/90 p-5 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm lg:p-8"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h2
          id="conciertos-titulo"
          className="font-['Ayer_Poster'] text-4xl leading-none tracking-[0.02em] lg:text-5xl"
        >
          Próximos conciertos
        </h2>
        {concerts.length > 0 && (
          <p className="text-sm font-bold uppercase tracking-widest text-gray-300">
            {concerts.length === 1 ? '1 fecha' : `${concerts.length} fechas`}
          </p>
        )}
      </div>

      {concerts.length ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <ol className="space-y-3">
            {concerts.map((concert) => (
              <ConcertItem key={concert.id} concert={concert} />
            ))}
          </ol>
          {months.length > 0 && (
            <div className="grid gap-5 self-start rounded-xl bg-white/5 p-4 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-1">
              {months.map((month) => (
                <MonthCalendar
                  key={month}
                  month={month}
                  concerts={concerts.filter((c) => c._isoDate?.startsWith(month))}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-lg text-gray-100">
          Pronto anunciaremos nuevas fechas. Síguenos en redes para no perderte
          ninguna.
        </p>
      )}

      <SubscribeForm />

      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          // "<" escaped so a concert name can't close the script tag
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </section>
  );
}

export default Concerts;
