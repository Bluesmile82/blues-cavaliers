import { Suspense } from 'react';
import NotionService from 'app/services/notion';
import Concerts from 'app/components/concerts';
import type { Metadata } from 'next';

async function getData() {
  const notionService = new NotionService();
  const data = await notionService.getInfo();
  return data?.map((d) => {
    return Object.entries(d).reduce((acc, [key, value]) => {
      // @ts-ignore
      const valueText = value.rich_text?.[0]?.plain_text;
      if (valueText) {
        // @ts-ignore
        acc[key] = valueText;
      }
      return acc;
    }, {});
  });
}

export default async function Page() {
  const concerts = await getData();

  return (
    <div className=" text-gray-300">
      <h1 className="font-sans text-6xl font-medium text-gray-300">
        Blues Cavaliers
      </h1>
      <h2 className="ml-1 mb-6">Una banda de blues acústico de Madrid</h2>
      <Suspense fallback={<div>...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Concerts promise={concerts} />
      </Suspense>
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/Ln6ss_0vOoY?controls=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Blues Cavaliers',
  description:
    'Una destacada banda de blues acústico en Madrid. Disfruta de la auténtica esencia del blues con estos grandes músicos. Sus interpretaciones te transportarán a las raíces del género, mientras te sumerges en su contagioso ritmo. Desde los escenarios de Madrid, los Blues Cavaliers te ofrecen una experiencia musical inigualable.',
  keywords:
    'Blues Cavaliers, banda de blues acústico, Madrid, esencia del blues, ritmo contagioso, música en vivo, mejores bandas de blues, escena madrileña, madrid, harmónica, harmonica, guitarra, guitar, blues, banda de blues, acústico',
  manifest: '/images/site.webmanifest',
  themeColor: '#ffffff',
  icons: [
    {
      rel: 'mask-icon',
      url: '/images/safari-pinned-tab.svg',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'favicon',
      url: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/images/apple-touch-icon.png',
    },
  ],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Blues Cavaliers',
    description: 'Una banda de blues acústico de Madrid',
    locale: 'es_ES',
    url: 'https://bluescavaliers.com',
    images: [
      {
        url: '/images/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Blues Cavaliers',
      },
    ],
    videos: [
      {
        url: 'https://www.youtube.com/embed/Ln6ss_0vOoY',
        width: 800,
        height: 600,
      },
    ],
  },
};
