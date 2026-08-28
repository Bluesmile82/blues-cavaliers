import Image from 'next/image';

const MEMBERS = [
  { name: 'Álvaro Leal', role: 'Guitarra y voz' },
  { name: 'Larry Mendoza', role: 'Armónica' },
  { name: 'Gabi Torné', role: 'Guitarra' },
];

function AboutBand() {
  return (
    <div className="rounded-lg bg-background/80 p-6 text-white shadow-xl backdrop-blur-[2px] lg:p-10">
      <p className="mb-1 text-base font-bold uppercase tracking-widest text-gray-300">
        Quiénes somos
      </p>
      <h2 className="font-['Ayer Poster'] mb-6 text-4xl font-bold tracking-wide text-white lg:text-5xl">
        Blues Cavaliers
      </h2>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Image
          src="/images/cavaliers.webp"
          alt="Blues Cavaliers tocando en directo"
          width={640}
          height={480}
          className="w-full flex-shrink-0 rounded-lg object-cover shadow-lg lg:w-80"
        />

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-lg leading-relaxed text-gray-100">
            Unidos por el amor al blues, nos embarcamos en un proyecto que trata
            de acercar esta música al público de un modo sencillo y directo.
            Nuestro repertorio abarca todos los estilos del género y se centra
            en las canciones, en su sentido y significado, dándoles prioridad
            absoluta.
          </p>
          <p className="mb-6 text-lg leading-relaxed text-gray-100">
            Blues del Mississippi, Chicago Blues, R&amp;B e incluso temas
            cercanos al soul y el jazz conforman esta propuesta que seguro os
            hará bailar.
          </p>

          <ul className="space-y-2">
            {MEMBERS.map((member) => (
              <li key={member.name} className="text-lg">
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
