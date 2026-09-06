interface VinylSpot {
  src: string;
  size: number; // px
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate: number; // deg
}

// Real vintage 78rpm blues label art (Paramount Records, Tommy Johnson —
// see vinylTommy*.png) plus a plain vinyl texture, scattered around the
// edges so the center stays clear for page content.
const VINYL_SPOTS: VinylSpot[] = [
  {
    src: '/images/vinylTommy.png',
    size: 420,
    top: '-12%',
    left: '-10%',
    rotate: -18,
  },
  {
    src: '/images/vinylTommyRed.png',
    size: 260,
    top: '55%',
    left: '-8%',
    rotate: 24,
  },
  {
    src: '/images/vinylTommyYellow.png',
    size: 340,
    top: '-8%',
    right: '-12%',
    rotate: 12,
  },
  {
    src: '/images/vinyl.jpg',
    size: 460,
    bottom: '-16%',
    right: '-12%',
    rotate: -6,
  },
  {
    src: '/images/vinylTommy.png',
    size: 220,
    bottom: '2%',
    left: '18%',
    rotate: 30,
  },
];

/**
 * Static "old blues" vinyl-label backdrop. This used to be a WebGL/three.js
 * scene (two Canvas layers, ~35 meshes, per-frame spin + noise/vignette
 * postprocessing) that was too heavy for mobile — a continuous 3D render
 * loop taxes battery/GPU on phones far more than a page with a few
 * background images. Fixed so it stays put while the page scrolls.
 */
export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Decorative, fixed-position background art — next/image's
          srcset/lazy-loading machinery isn't worth it here. */}
      {VINYL_SPOTS.map((spot, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={spot.src}
          alt=""
          aria-hidden="true"
          className="absolute opacity-60"
          style={{
            width: spot.size,
            height: spot.size,
            top: spot.top,
            bottom: spot.bottom,
            left: spot.left,
            right: spot.right,
            transform: `rotate(${spot.rotate}deg)`,
          }}
        />
      ))}
      {/* light overall tint so the images read as background, not foreground */}
      <div className="absolute inset-0 bg-background/40" />
    </div>
  );
}
