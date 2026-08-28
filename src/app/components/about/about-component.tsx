import Image from 'next/image';

const MEMBERS = [
  { name: 'Álvaro Leal', role: 'Guitarra y voz' },
  { name: 'Larry Mendoza', role: 'Armónica' },
  { name: 'Gabi Torné', role: 'Guitarra' },
];

function AboutBand() {
  return (
    <div className="rounded-lg border-4 border-white bg-background/80 p-6 text-white backdrop-blur-[2px] lg:p-8">
      <p className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-300">
        Quiénes somos
      </p>
      <h2 className="font-['Ayer Poster'] mb-5 text-3xl font-bold tracking-wide text-white lg:text-4xl">
        Blues Cavaliers
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Image
          src="/images/cavaliers.webp"
          alt="Blues Cavaliers tocando en directo"
          width={640}
          height={480}
          className="w-full flex-shrink-0 rounded-lg border-4 border-white object-cover shadow-lg lg:w-72"
        />

        <div>
          <p className="mb-4 text-sm leading-relaxed text-gray-100 lg:text-base">
            Unidos por el amor al blues, nos embarcamos en un proyecto que trata
            de acercar esta música al público de un modo sencillo y directo.
            Nuestro repertorio abarca todos los estilos del género y se centra
            en las canciones, en su sentido y significado, dándoles prioridad
            absoluta.
          </p>
          <p className="mb-5 text-sm leading-relaxed text-gray-100 lg:text-base">
            Blues del Mississippi, Chicago Blues, R&amp;B e incluso temas
            cercanos al soul y el jazz conforman esta propuesta que seguro os
            hará bailar.
          </p>

          <ul className="space-y-1">
            {MEMBERS.map((member) => (
              <li key={member.name} className="text-sm lg:text-base">
                <span className="font-bold text-white">{member.name}</span>
                <span className="text-gray-300"> — {member.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AboutBand;
