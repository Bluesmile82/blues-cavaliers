interface Concert {
  name: string;
  date: string;
  time: string;
  price: string;
  direction: string;
  direction_link: string;
}

async function Concerts({ promise }: { promise: Promise<Concert[]> }) {
  // Wait for the concerts promise to resolve
  const concerts = await promise;

  return (
    <div className="ml-1 mb-6 max-w-[500px] rounded-lg bg-ucla-blue/70 p-4 text-white backdrop-blur-[2px]">
      <div className="mb-4 text-xl font-bold">
        {concerts && concerts.length
          ? 'Próximos conciertos'
          : 'No hay conciertos pendientes'}
      </div>
      <ul className="space-y-3">
        {concerts &&
          concerts
            .map(
              (concert) =>
                concert.name && (
                  <li key={concert.name} className="text-sm text-gray-100">
                    {concert.date} -{concert.time} -
                    {
                      <span className="text-base font-bold text-white">
                        {concert.name}
                      </span>
                    }{' '}
                    - Precio: {concert.price} -{' '}
                    <a
                      className="text-gray-300 underline"
                      target="_blank"
                      rel="noreferrer"
                      href={concert.direction_link}
                    >
                      {concert.direction}
                    </a>
                  </li>
                ),
            )
            .reverse()}
      </ul>
    </div>
  );
}

export default Concerts;
