interface Concert {
  name: string;
  date: string;
  time: string;
  price: string;
  direction: string;
}

async function Concerts({ promise }: { promise: Promise<Concert[]> }) {
  // Wait for the concerts promise to resolve
  const concerts = await promise;

  return (
    <div className="ml-1 mb-6">
      Próximos conciertos
      <ul>
        {concerts &&
          concerts.map(
            (concert) =>
              concert.name && (
                <li key={concert.name} className="text-sm text-white">
                  {concert.date} -{concert.time} -{concert.name} - Precio:{' '}
                  {concert.price} -{' '}
                  <a
                    className="text-blue underline"
                    target="_blank"
                    rel="noreferrer"
                    href={concert.direction}
                  >
                    Dirección
                  </a>
                </li>
              ),
          )}
      </ul>
    </div>
  );
}

export default Concerts;
