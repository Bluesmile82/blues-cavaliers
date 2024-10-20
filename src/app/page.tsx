import { Suspense } from 'react';
import NotionService from 'src/app/services/notion';
import Concerts from '#/src/app/components/concerts';
// export { metadata } from './metadata';
import Background from 'src/app/components/background';

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
    <>
      <div className="text-gray-300">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <h1 className="font-['Ayer Poster'] my-6 text-center text-[20vw] font-bold leading-[25vw] tracking-wider  text-white lg:text-[12vw] lg:leading-[13vw]">
              BLUES CAVALIERS
            </h1>
            <div className="flex justify-center gap-4 max-lg:flex-wrap">
              <iframe
                className="shadow-50/30 max-w-[400px] rounded-xl border-4 border-white shadow-lg"
                width="100%"
                height="232"
                src="https://www.youtube.com/embed/Ln6ss_0vOoY"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <Suspense fallback={<div>...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <Concerts promise={concerts} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
