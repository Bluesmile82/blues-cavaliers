import { Suspense } from 'react';
import NotionService from 'app/services/notion';
import Concerts from 'app/components/concerts';
import Links from 'app/components/links';

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
    <div className="container mx-8 text-gray-300">
      <h1 className="font-sans text-6xl font-medium text-gray-300">
        Blues Cavaliers
      </h1>
      <p className="ml-1 mb-6">Una banda de blues acústico de Madrid</p>
      <Suspense fallback={<div>...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Concerts promise={concerts} />
      </Suspense>
      <Links />
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
