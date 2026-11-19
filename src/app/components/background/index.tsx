'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from '#/src/app/components/icons';

const YT_ID = 'Ln6ss_0vOoY';
const INTRO_SECONDS = 5;
// YouTube's startup controls (pause/prev/next) sit over the video's centred
// logo until ~3.5s and no embed param turns them off, so an identical logo
// image is laid on top. Measured from the video: the controls are gone by
// ~3.6s and the logo starts shrinking into the corner at ~3.75s; the
// image dissolves in that short window
const LOGO_FADE_START = 3.5; // + the 250ms CSS fade, done by ~3.75s
// where the diamond's outer edges sit in the 16:9 video frame
const LOGO_WIDTH = '42.15%';
const LOGO_CENTER_Y = '54.33%';
// the video's logo is a touch warmer than the PNG and falls off slightly
// towards the top and bottom tips; multiplied over the PNG, clipped to it
const LOGO_GRADE =
  'linear-gradient(to bottom, rgb(244 232 218), rgb(250 240 228) 8%, rgb(255 246 235) 18%, rgb(255 246 237) 50%, rgb(255 244 232) 72%, rgb(246 235 222) 82%, rgb(238 226 213) 92%, rgb(234 222 209))';

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

  // the video opens with ~5s of the band logo: show it clean, tint afterwards.
  // Tracks the player's own clock, so the logo is clean again on every loop.
  const [intro, setIntro] = useState(true);
  const [logo, setLogo] = useState(true);
  useEffect(() => {
    // the player only reports its time ~4x a second, and those reports lag;
    // each one says when it was taken (currentTimeLastUpdated_), so we
    // extrapolate the real time and schedule the fade to the exact moment
    let playing = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const onMessage = (e: MessageEvent) => {
      if (!/youtube/.test(e.origin) || typeof e.data !== 'string') return;
      let info: any;
      try {
        info = JSON.parse(e.data)?.info;
      } catch {
        return;
      }
      if (typeof info?.playerState === 'number') playing = info.playerState === 1;
      if (typeof info?.currentTime !== 'number') return;
      const at = info.currentTimeLastUpdated_ ?? Date.now() / 1000;
      const now = playing ? info.currentTime + (Date.now() / 1000 - at) : info.currentTime;
      setIntro(now < INTRO_SECONDS);
      setLogo(now < LOGO_FADE_START);
      clearTimeout(fadeTimer);
      if (playing && now < LOGO_FADE_START) {
        fadeTimer = setTimeout(() => setLogo(false), (LOGO_FADE_START - now) * 1000);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(fadeTimer);
    };
  }, []);

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
          // ponytail: classic 16:9 "cover" box, whichever side overflows gets
          // cropped; scaled 1.25x so YouTube's corner overlays (channel title,
          // "More videos", logo) fall off-screen
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-125">
            <iframe
              ref={iframeRef}
              className="absolute inset-0 h-full w-full"
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
                    // "listening" makes the player stream infoDelivery
                    // messages (currentTime) back to us
                    iframe.contentWindow?.postMessage(
                      JSON.stringify({ event: 'listening', id: YT_ID }),
                      '*',
                    );
                    ytCommand(iframe, 'unloadModule', ['captions']);
                    ytCommand(iframe, 'unloadModule', ['cc']);
                  }, ms),
                );
              }}
              tabIndex={-1}
              aria-hidden
            />
            {/* same box as the video, so it lands exactly on the video's logo */}
            <div
              aria-hidden
              className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 isolate transition-opacity duration-[250ms] ${
                logo ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ width: LOGO_WIDTH, top: LOGO_CENTER_Y }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-diamond.png" alt="" className="block w-full" />
              {/* colour grade, clipped to the diamond by using it as a mask */}
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background: LOGO_GRADE,
                  WebkitMaskImage: 'url(/images/logo-diamond.png)',
                  maskImage: 'url(/images/logo-diamond.png)',
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }}
              />
            </div>
          </div>
        )}
        {/* tint so the text stays readable over the footage, held off
            while the intro logo plays */}
        <div
          className={`absolute inset-0 bg-background/60 transition-opacity duration-1000 ${
            intro && load ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
      {/* the two calls to action, side by side and always in reach */}
      <aside
        aria-label="Escuchar a Blues Cavaliers"
        className="fixed inset-x-0 bottom-6 z-30 flex flex-wrap items-center justify-center gap-3 px-4"
      >
        <button
          type="button"
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wider shadow-2xl transition motion-safe:hover:scale-105 sm:gap-3 sm:px-7 sm:py-4 sm:text-base sm:tracking-widest ${
            sound
              ? 'bg-background/80 text-white ring-2 ring-white'
              : 'bg-white text-background ring-4 ring-white/40'
          }`}
        >
          {sound ? (
            <Volume2 aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <VolumeX aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
          {sound ? 'Silenciar' : 'Activar sonido'}
        </button>
        <a
          href="https://too.fm/o0jqbby"
          target="_blank"
          rel="noopener noreferrer"
          // the visible label is shortened on phones; keep the full one for
          // screen readers, plus the new-tab warning
          aria-label="Escúchanos en tu plataforma favorita (se abre en una pestaña nueva)"
          className="rounded-full border-2 border-white bg-background/70 px-5 py-[10px] text-sm font-bold uppercase tracking-wider text-white shadow-2xl backdrop-blur-sm transition hover:bg-white hover:text-background motion-safe:hover:scale-105 sm:px-7 sm:py-[14px] sm:text-base sm:tracking-widest"
        >
          Escúchanos
          <span className="max-sm:hidden"> en tu plataforma favorita</span>
        </a>
      </aside>
    </>
  );
}
