const MEMBERS = [
  { name: 'Álvaro Leal', role: 'Guitarra y voz' },
  { name: 'Larry Mendoza', role: 'Armónica' },
  { name: 'Gabi Torné', role: 'Guitarra' },
];

// schema.org description of the band for search engines
const BAND_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'Blues Cavaliers',
  url: 'https://www.bluescavaliers.com',
  description: 'Banda de blues acústico de Madrid.',
  genre: ['Blues', 'Acoustic blues', 'Chicago blues', 'R&B'],
  image: 'https://www.bluescavaliers.com/images/cavaliers-live.jpg',
  foundingLocation: { '@type': 'Place', name: 'Madrid, España' },
  member: MEMBERS.map((member) => ({
    '@type': 'OrganizationRole',
    member: { '@type': 'Person', name: member.name },
    roleName: member.role,
  })),
  sameAs: [
    'https://www.facebook.com/bluescavaliers',
    'https://www.instagram.com/cavaliersblues',
    'https://www.youtube.com/watch?v=Ln6ss_0vOoY',
  ],
};

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
        {/* eslint-disable-next-line @next/next/no-img-element -- plain <img>
            avoids Next's image optimizer, which was failing to serve this
            asset on the Netlify deploy preview */}
        <img
          src="/images/cavaliers-live.jpg"
          alt="Álvaro Leal, Larry Mendoza y Gabi Torné, de Blues Cavaliers, tocando en directo"
          className="aspect-[5/7] w-full flex-shrink-0 rounded-lg object-cover shadow-lg lg:w-72"
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
      <script
        type="application/ld+json"
        // static object defined above; "<" escaped as a matter of habit
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(BAND_JSON_LD).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}

export default AboutBand;
