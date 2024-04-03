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
    <div className="ml-1 mb-6 pt-[82px]">
      <div className="text-xl mb-4 font-bold">
        {concerts && concerts.length
          ? 'Próximos conciertos'
          : 'No hay conciertos pendientes'}
      </div>
      <ul className="space-y-3">
        {concerts &&
          concerts.map(
            (concert) =>
              concert.name && (
                <li key={concert.name} className="text-sm text-gray-100">
                  {concert.date} -{concert.time} -{<span className="text-base text-white font-bold">{concert.name}</span>} - Precio:{' '}
                  {concert.price} -{' '}
                  <a
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noreferrer"
                    href={concert.direction}
                  >
                    Dirección
                  </a>
                </li>
              ),
          ).reverse()}
      </ul>
    </div>
  );
}

export default Concerts;
