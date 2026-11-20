import { Suspense } from 'react';
import { ChevronDown } from '#/src/app/components/icons';
import Concerts from '#/src/app/components/concerts';
import AboutBand from '#/src/app/components/about';
import { getConcerts } from '#/src/app/lib/concerts';

// re-fetch Notion concerts hourly instead of freezing them at build time
export const revalidate = 3600;

export default async function Page() {
  const concerts = await getConcerts();

  return (
    <>
      <div className="text-gray-300">
        {/* the first screen is left to the video; concerts come right after
            the "Desliza" hint */}
        <div aria-hidden className="pointer-events-none h-[100svh]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[calc(100svh-11rem)] flex flex-col items-center gap-1 text-xs font-bold uppercase tracking-widest text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.8)]"
        >
          Desliza
          <ChevronDown className="h-6 w-6 drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.8)] motion-safe:animate-bounce" />
        </div>
        {/* target of the "Saltar al contenido" skip link */}
        <div id="contenido" className="scroll-mt-28">
          <div className="pointer-events-auto relative z-20 mx-auto flex max-w-5xl justify-center px-4 mb-10">
            <Suspense fallback={null}>
              {/* @ts-expect-error Async Server Component */}
              <Concerts promise={concerts} />
            </Suspense>
          </div>
          <div className="pointer-events-auto relative z-20 mx-auto mb-40 max-w-3xl px-4">
            <AboutBand />
          </div>
        </div>
      </div>
    </>
  );
}
