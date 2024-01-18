import { Suspense } from 'react';
import NotionService from 'app/services/notion';
import Concerts from 'app/components/concerts';
export { metadata } from './metadata';

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
      <Suspense fallback={<div>...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Concerts promise={concerts} />
      </Suspense>
      <div className="flex items-center justify-center">
        <iframe
          className="shado-50/30 max-w-[800px] rounded-xl border-4 border-white shadow-lg"
          width="100%"
          height="432"
          src="https://www.youtube.com/embed/Ln6ss_0vOoY"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
