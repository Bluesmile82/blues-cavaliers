import 'styles/globals.css';
import { Overpass, Roboto_Mono } from 'next/font/google';
import Header from 'app/components/header';

const inter = Overpass({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-overpass',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body className="flex h-screen items-center justify-center overflow-y-scroll bg-gray-1100 bg-[url('/grid.svg')]">
        <main className="container relative mx-8">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
