interface Concert {
  name: string;
  date?: string;
  time?: string;
  price?: string;
  direction?: string;
  direction_link?: string;
  _isoDate?: string;
}

const SITE_URL = 'https://www.bluescavaliers.com';

function upcomingConcertsSorted(concerts: Concert[]) {
  const today = new Date().toISOString().slice(0, 10);
  return [...concerts]
    .filter((concert) => !concert._isoDate || concert._isoDate >= today)
    .sort((a, b) =>
      (a._isoDate ?? '9999-12-31').localeCompare(b._isoDate ?? '9999-12-31'),
    );
}

// "21:30", "21.30h", "9:30" → "21:30"; anything else is left out of the ISO date
function isoTime(time?: string) {
  const match = time?.match(/(\d{1,2})[:.h](\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : undefined;
}

function startDate(concert: Concert) {
  if (!concert._isoDate) return undefined;
  const time = isoTime(concert.time);
  return time ? `${concert._isoDate}T${time}` : concert._isoDate;
}

// schema.org MusicEvent list, so search engines can show the dates as events
function eventsJsonLd(concerts: Concert[]) {
  return concerts
    .filter((concert) => concert._isoDate)
    .map((concert) => {
      const price = concert.price?.replace(',', '.').match(/\d+(\.\d+)?/)?.[0];
      const free = /gratis|libre|free/i.test(concert.price ?? '');
      return {
        '@context': 'https://schema.org',
        '@type': 'MusicEvent',
        name: `Blues Cavaliers: ${concert.name}`,
        startDate: startDate(concert),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
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
            url: `${SITE_URL}/#conciertos`,
          },
        }),
      };
    });
}

async function Concerts({ promise }: { promise: Promise<Concert[]> }) {
  const concerts = upcomingConcertsSorted((await promise) ?? []);
  const jsonLd = eventsJsonLd(concerts);

  return (
    // the navbar's "Conciertos" link targets this; scroll-mt clears the fixed header
    <section
      id="conciertos"
      aria-labelledby="conciertos-titulo"
      className="w-full scroll-mt-28 rounded-lg bg-background/80 p-5 text-white shadow-xl backdrop-blur-[2px] lg:p-8"
    >
      <h2 id="conciertos-titulo" className="mb-4 text-2xl font-bold lg:text-3xl">
        Próximos conciertos
      </h2>
      {concerts.length ? (
        <ul className="space-y-4">
          {concerts.map((concert) => {
            const when = [concert.date, concert.time].filter(Boolean).join(' - ');
            return (
              <li key={concert.name + concert.date} className="text-base text-gray-100 lg:text-lg">
                {when &&
                  (startDate(concert) ? (
                    <time dateTime={startDate(concert)}>{when}</time>
                  ) : (
                    when
                  ))}
                {when && ' - '}
                <span className="text-lg font-bold text-white lg:text-xl">
                  {concert.name}
                </span>
                {concert.price && <> - Precio: {concert.price}</>}
                {concert.direction_link ? (
                  <>
                    {' - '}
                    <a
                      className="pointer-events-auto text-gray-300 underline hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={concert.direction_link}
                    >
                      {concert.direction ?? concert.direction_link}
                      <span className="sr-only"> (mapa, se abre en una pestaña nueva)</span>
                    </a>
                  </>
                ) : (
                  concert.direction && <> - {concert.direction}</>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-lg text-gray-100">
          Pronto anunciaremos nuevas fechas. Síguenos en redes para no perderte
          ninguna.
        </p>
      )}
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
