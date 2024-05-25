import 'styles/globals.css';
import { Rationale, Overpass, Roboto_Mono } from 'next/font/google';
import Header from 'app/components/header';
import Image from 'next/image';

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
      <body className="flex h-screen items-center justify-center overflow-y-scroll">
        <div className="halftone absolute z-0 h-screen w-screen">
          <Image
            src="/images/cavaliers.webp"
            className="h-screen w-screen object-cover"
            alt="Blues cavaliers photo"
            width={1024}
            height={768}
            layout="full"
          />
        </div>
        <Header />
        <main className="container relative mx-8">{children}</main>
      </body>
    </html>
  );
}
