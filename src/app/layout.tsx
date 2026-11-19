import 'src/styles/globals.css';
import { Rationale, Overpass, Roboto_Mono } from 'next/font/google';
import Header from '#/src/app/components/header';
import Image from 'next/image';
import Background from '#/src/app/components/background';
// page <title>, description and icons (the export in page.tsx was commented out)
export { metadata } from './metadata';

// "Ayer Poster" (the display font used for headings) is registered once via
// @font-face in globals.css and applied selectively with font-['Ayer Poster'].
// It used to also be loaded here via next/font/local and applied to <html>,
// which forced the decorative poster font onto every piece of body text on
// the site (concert listings, bios, etc.) instead of just headings.

const inter = Overpass({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-overpass',
});

const rationale = Rationale({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rationale',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${rationale.variable}`}>
      <body className="relative min-h-screen">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-full bg-white font-bold text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-4 focus:py-2"
        >
          Saltar al contenido
        </a>
        <Background />
        <Header />
        <main className="container pointer-events-none relative mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
