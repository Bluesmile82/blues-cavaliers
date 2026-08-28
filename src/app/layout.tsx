import 'src/styles/globals.css';
import { Rationale, Overpass, Roboto_Mono } from 'next/font/google';
import Header from '#/src/app/components/header';
import Image from 'next/image';
import Background, { Foreground } from '#/src/app/components/background';

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
        <Background />
        <Header />
        <main className="container pointer-events-none relative mx-8">
          {children}
        </main>
        <Foreground />
      </body>
    </html>
  );
}
