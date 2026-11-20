'use client';

import { FormEvent, useState } from 'react';

// ponytail: the browser writes straight to Firestore's REST API, no server.
// firestore.rules only allow creating suscriptores/<email> holding that same
// email, so nobody can read or change the list from here. The address doubles
// as the document id: subscribing twice is a no-op (409).
const ENDPOINT =
  'https://firestore.googleapis.com/v1/projects/blues-cavaliers/databases/(default)/documents/suscriptores';

// Anti-spam: Firebase App Check with reCAPTCHA v3 (invisible). Every write
// carries a token proving it came from this site in a real browser; with
// enforcement on in the Firebase console, Firestore rejects anything else.
// Both values are public by design.
const RECAPTCHA_SITE_KEY = '6LcSQiouAAAAAFy4hjmEyNyRXG6bPLOlPW9M_kSC';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDw9lwT9_LbZXuL43Qaq-b4TF0kzMUHqvM',
  authDomain: 'blues-cavaliers.firebaseapp.com',
  projectId: 'blues-cavaliers',
  appId: '1:132607808012:web:58d08983bf8f0da2569429',
};

// loaded on first focus of the form, so visitors who never subscribe don't
// download Firebase or reCAPTCHA, and the token is ready by the time they submit
let appCheck: Promise<import('firebase/app-check').AppCheck | null> | undefined;
function startAppCheck() {
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve(null);
  appCheck ??= (async () => {
    const [{ initializeApp }, { initializeAppCheck, ReCaptchaV3Provider }] =
      await Promise.all([import('firebase/app'), import('firebase/app-check')]);
    // localhost isn't an allowed reCAPTCHA domain: dev uses a debug token
    // registered in the console (it's printed in the browser console)
    if (process.env.NODE_ENV === 'development') {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    return initializeAppCheck(initializeApp(FIREBASE_CONFIG), {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: false,
    });
  })();
  return appCheck;
}

async function appCheckHeader(): Promise<Record<string, string>> {
  try {
    const check = await startAppCheck();
    if (!check) return {};
    const { getToken } = await import('firebase/app-check');
    return { 'X-Firebase-AppCheck': (await getToken(check)).token };
  } catch {
    // reCAPTCHA blocked (ad blocker) or down: send without a token. Until
    // enforcement is on that still goes through; afterwards Firestore refuses it
    return {};
  }
}

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
      const res = await fetch(
        `${ENDPOINT}?documentId=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await appCheckHeader()),
          },
          body: JSON.stringify({ fields: { email: { stringValue: email } } }),
        },
      );
      setStatus(res.ok || res.status === 409 ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3
        id="suscribete-titulo"
        className="text-lg font-bold text-white lg:text-xl"
      >
        Avísame de los próximos conciertos
      </h3>
      {status === 'done' ? (
        <p role="status" className="mt-2 text-gray-100">
          ¡Hecho! Te escribiremos cuando anunciemos nuevas fechas.
        </p>
      ) : (
        <form
          onSubmit={submit}
          onFocus={startAppCheck}
          aria-labelledby="suscribete-titulo"
          className="mt-3"
        >
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
              className="h-12 min-w-0 rounded-full border-0 bg-white px-5 text-base text-background placeholder:text-gray-500 focus:ring-2 focus:ring-white sm:flex-1"
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
              Acepto que Blues Cavaliers guarde mi email solo para avisarme de
              sus conciertos. Puedo darme de baja cuando quiera respondiendo a
              cualquier aviso.
            </span>
          </label>
          {/* Google requires this notice when its badge is hidden (globals.css) */}
          <p className="mt-2 text-xs text-gray-400">
            Protegido por reCAPTCHA de Google:{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacidad
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>{' '}
            y{' '}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              condiciones
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            .
          </p>
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
