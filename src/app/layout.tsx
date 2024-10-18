import 'src/styles/globals.css';
import { Rationale, Overpass, Roboto_Mono } from 'next/font/google';
import Header from '#/src/app/components/header';
import Image from 'next/image';
import Background from '#/src/app/components/background';
import localFont from 'next/font/local';

const Ayer = localFont({
  src: [
    {
      path: '../../public/AyerPoster-Medium.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
});

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
    <html
      lang="es"
      className={`${inter.variable} ${rationale.variable} ${Ayer.className}`}
    >
      <body className="flex h-screen items-center justify-center overflow-y-scroll">
        <Background />
        <Header />
        <main className="container relative mx-8">{children}</main>
      </body>
    </html>
  );
}
