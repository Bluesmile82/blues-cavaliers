'use client';

import { FormEvent, useState } from 'react';

// ponytail: the browser writes straight to Firestore's REST API, no Firebase
// SDK or server. firestore.rules only allow creating suscriptores/<email>
// holding that same email, so nobody can read or change the list from here.
// The address doubles as the document id: subscribing twice is a no-op (409).
const ENDPOINT =
  'https://firestore.googleapis.com/v1/projects/blues-cavaliers/databases/(default)/documents/suscriptores';

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function SubscribeForm() {
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // bots fill every field; people never see this one
    if (data.get('web')) return setStatus('done');
    const email = String(data.get('email')).trim().toLowerCase();
    setStatus('sending');
    try {
      const res = await fetch(`${ENDPOINT}?documentId=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { email: { stringValue: email } } }),
      });
      setStatus(res.ok || res.status === 409 ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 id="suscribete-titulo" className="text-lg font-bold text-white lg:text-xl">
        Avísame de los próximos conciertos
      </h3>
      {status === 'done' ? (
        <p role="status" className="mt-2 text-gray-100">
          ¡Hecho! Te escribiremos cuando anunciemos nuevas fechas.
        </p>
      ) : (
        <form onSubmit={submit} aria-labelledby="suscribete-titulo" className="mt-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="suscribete-email" className="sr-only">
              Tu email
            </label>
            <input
              id="suscribete-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="tu@email.com"
              className="h-12 min-w-0 rounded-full sm:flex-1 border-0 bg-white px-5 text-base text-background placeholder:text-gray-500 focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="h-12 shrink-0 rounded-full bg-white px-6 text-sm font-bold uppercase tracking-wider text-background ring-2 ring-white transition hover:bg-background hover:text-white disabled:opacity-60"
            >
              {status === 'sending' ? 'Enviando…' : 'Suscribirme'}
            </button>
          </div>
          {/* honeypot, hidden from people and screen readers */}
          <input
            type="text"
            name="web"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
          />
          <label className="mt-3 flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-white"
            />
            <span>
              Acepto que Blues Cavaliers guarde mi email solo para avisarme de sus
              conciertos. Puedo darme de baja cuando quiera respondiendo a cualquier
              aviso.
            </span>
          </label>
          {status === 'error' && (
            <p role="alert" className="mt-2 text-sm font-bold text-red-300">
              No se ha podido guardar. Inténtalo de nuevo en un momento.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
