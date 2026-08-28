interface Concert {
  name: string;
  date?: string;
  time?: string;
  price?: string;
  direction?: string;
  direction_link?: string;
  _isoDate?: string;
}

function upcomingConcertsSorted(concerts: Concert[]) {
  const today = new Date().toISOString().slice(0, 10);
  return [...concerts]
    .filter((concert) => !concert._isoDate || concert._isoDate >= today)
    .sort((a, b) =>
      (a._isoDate ?? '9999-12-31').localeCompare(b._isoDate ?? '9999-12-31'),
    );
}

async function Concerts({ promise }: { promise: Promise<Concert[]> }) {
  // Wait for the concerts promise to resolve
  const concerts = upcomingConcertsSorted((await promise) ?? []);

  if (!concerts.length) return null;

  return (
    <div className="ml-1 mb-6 h-full max-w-[500px] rounded-lg border-4 border-white bg-background/80 p-4 text-white backdrop-blur-[2px]">
      <div className="mb-4 text-xl font-bold">Próximos conciertos</div>
      <ul className="space-y-3">
        {concerts.map((concert) => (
          <li key={concert.name} className="text-sm text-gray-100">
            {[concert.date, concert.time].filter(Boolean).join(' - ')}
            {(concert.date || concert.time) && ' - '}
            <span className="text-base font-bold text-white">
              {concert.name}
            </span>
            {concert.price && <> - Precio: {concert.price}</>}
            {concert.direction_link ? (
              <>
                {' - '}
                <a
                  className="pointer-events-auto text-gray-300 underline"
                  target="_blank"
                  rel="noreferrer"
                  href={concert.direction_link}
                >
                  {concert.direction ?? concert.direction_link}
                </a>
              </>
            ) : (
              concert.direction && <> - {concert.direction}</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Concerts;
