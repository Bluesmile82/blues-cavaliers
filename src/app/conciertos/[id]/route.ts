import { getConcerts, icsFile } from '#/src/app/lib/concerts';

// /conciertos/<id>.ics → one-event calendar file (Apple Calendar, Outlook
// desktop, Thunderbird…). Built from our own Notion data, never from the URL,
// so nobody can make the site serve arbitrary calendar files.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id.replace(/\.ics$/, '');
  const concert = (await getConcerts()).find((c) => c.id === id);
  const body = concert && icsFile(concert);
  if (!body) return new Response('Concierto no encontrado', { status: 404 });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="blues-cavaliers-${id}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
