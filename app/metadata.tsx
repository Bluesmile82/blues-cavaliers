import type { Metadata } from 'next';

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
      url: '/images/favicon-32x32.png',
    },
    {
      rel: 'icon',
      sizes: '16x16',
      url: '/images/favicon-16x16.png',
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
  twitter: {
    card: 'summary_large_image',
    // site: '@bluescavaliers',
    // creator: '@bluescavaliers',
    images: [
      {
        url: '/images/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Blues Cavaliers',
      },
    ],
  },
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
