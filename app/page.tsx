import { Suspense } from 'react';
import NotionService from '../services/notion';
import Concerts from 'components/concerts';
import Links from 'components/links';

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
    <div className="text-gray-300">
      <h1 className="text-6xl font-medium text-gray-300">Blues cavaliers</h1>
      <p className="ml-1 mb-6">Una banda de blues acústico de Madrid</p>
      <Suspense fallback={<div>...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Concerts promise={concerts} />
      </Suspense>
      <Links />
    </div>
  );
}
