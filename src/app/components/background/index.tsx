'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const YT_ID = 'Ln6ss_0vOoY';

// Browsers only autoplay muted video, so the backdrop starts silent and the
// "Activar sonido" button unmutes it through the YouTube iframe API
// (postMessage, enabled by enablejsapi=1).
function ytCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    '*',
  );
}

/**
 * The band's YouTube video as a full-bleed, looping backdrop. YouTube's
 * adaptive streaming already serves the best quality the connection and the
 * (viewport-sized) player allow, up to 1080p/4K on large screens. On
 * Save-Data, 2g connections or reduced-motion the stream isn't loaded and the
 * max-res thumbnail stays as a still poster until the visitor asks for sound.
 */
export default function Background() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [load, setLoad] = useState(false);
  const [sound, setSound] = useState(false);
  // only read when the iframe first mounts; changing it later would reload the player
  const [startMuted, setStartMuted] = useState(true);

  useEffect(() => {
    const c = (navigator as any).connection;
    const slow = c?.saveData || /2g/.test(c?.effectiveType ?? '');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLoad(!slow && !still);
  }, []);

  const toggleSound = () => {
    if (!load) {
      // poster-only visitors: load the player now, already unmuted (the
      // click counts as the user gesture that allows audible autoplay)
      setStartMuted(false);
      setLoad(true);
      setSound(true);
      return;
    }
    if (sound) {
      ytCommand(iframeRef.current, 'mute');
    } else {
      ytCommand(iframeRef.current, 'unMute');
      ytCommand(iframeRef.current, 'setVolume', [100]);
      ytCommand(iframeRef.current, 'playVideo');
    }
    setSound(!sound);
  };

  const params = new URLSearchParams({
    autoplay: '1',
    mute: startMuted ? '1' : '0',
    loop: '1',
    playlist: YT_ID,
    controls: '0',
    playsinline: '1',
    disablekb: '1',
    rel: '0',
    iv_load_policy: '3',
    cc_load_policy: '0',
    enablejsapi: '1',
  });

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden bg-background bg-cover bg-center"
        style={{
          backgroundImage: `url(https://i.ytimg.com/vi/${YT_ID}/maxresdefault.jpg)`,
        }}
      >
        {load && (
          // ponytail: classic 16:9 "cover" sizing, whichever side overflows gets cropped
          <iframe
            ref={iframeRef}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            src={`https://www.youtube-nocookie.com/embed/${YT_ID}?${params}`}
            title="Blues Cavaliers en directo"
            allow="autoplay; encrypted-media"
            // cc_load_policy=0 only stops YouTube forcing captions on; viewers
            // with "always show captions" still get them, so unload the module
            // ponytail: the player isn't ready the instant the iframe loads, so
            // resend a few times instead of wiring up the full ready handshake
            onLoad={(e) => {
              const iframe = e.currentTarget;
              [0, 1500, 4000].forEach((ms) =>
                setTimeout(() => {
                  ytCommand(iframe, 'unloadModule', ['captions']);
                  ytCommand(iframe, 'unloadModule', ['cc']);
                }, ms),
              );
            }}
            tabIndex={-1}
            aria-hidden
          />
        )}
        {/* tint so the title and text stay readable over the footage */}
        <div className="absolute inset-0 bg-background/60" />
      </div>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        className={`fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full px-7 py-4 text-base font-bold uppercase tracking-widest shadow-2xl transition hover:scale-105 ${
          sound
            ? 'bg-background/80 text-white ring-2 ring-white'
            : 'bg-white text-background ring-4 ring-white/40'
        }`}
      >
        {sound ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        {sound ? 'Silenciar' : 'Activar sonido'}
      </button>
    </>
  );
}
