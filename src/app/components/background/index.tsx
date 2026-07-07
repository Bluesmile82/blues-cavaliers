'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Mesh } from 'three';
import { Menu } from 'lucide-react';

// Top of the fall loop. Camera (fov 20, z=10) sees roughly y ∈ [-2, 2] at the
// vinyls' depth, so spawn/recycle a little above the frame and fall through it.
const TOP = 3.5;
const CAMERA_Z = 10;
const RADIAL_SEGMENTS = 48; // grooves come from the texture; 48 keeps the rim smooth
const GEOMETRY_HEIGHT = 0.0001;

// reused local-Y axis for the per-frame spin (cylinder's height axis is its Y,
// which is the disc face-normal — i.e. how a record actually spins)
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// idle / hovered spin in rad/sec — slow and steady, faster when interacted with
const SPIN_IDLE = 0.2;
const SPIN_HOVER = 1.2;

type Variant = 'tommy' | 'red' | 'yellow';

function variantForIndex(index: number): Variant {
  if (index % 4 === 0) return 'yellow';
  if (index % 3 === 0) return 'red';
  return 'tommy';
}

type ItemData = {
  position: [number, number, number];
  rotation: [number, number, number];
  fallSpeed: number;
  variant: Variant;
};

function Vinyl({
  item,
  geometry,
  material,
}: {
  item: ItemData;
  geometry: THREE.CylinderGeometry;
  material: THREE.Material;
}) {
  const ref = useRef<Mesh>(null);
  const hovered = useRef(false);

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    // continuous fall; recycle to the top once below the visible band
    m.position.y -= item.fallSpeed * delta;
    if (m.position.y < -TOP) m.position.y = TOP;
    // spin about local Y (the disc face-normal) — like a record playing
    m.rotateOnAxis(Y_AXIS, (hovered.current ? SPIN_HOVER : SPIN_IDLE) * delta);
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={item.position}
      rotation={item.rotation}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={() => (hovered.current = false)}
    />
  );
}

/**
 * Renders a single layer of falling vinyls. Used twice: once behind the page
 * content (z < camera) and once in front of it (z closer to camera) so vinyls
 * can pass over the "BLUES CAVALIERS" h1.
 *
 * Geometry and the 3 materials (one per texture variant) are created once per
 * layer and shared by every mesh — three.js then issues very cheap draw calls
 * (no per-mesh GPU resource upload).
 */
function VinylLayer({
  count,
  radius,
  xSpread,
  zRange,
}: {
  count: number;
  radius: number;
  xSpread: number;
  zRange: [number, number];
}) {
  const [tommyTex, redTex, yellowTex, roughnessMap, normalMap] = useLoader(
    TextureLoader,
    [
      '/images/vinylTommy.png',
      '/images/vinylTommyRed.png',
      '/images/vinylTommyYellow.png',
      '/images/vinyl.jpg',
      '/images/normal.png',
    ],
  );

  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        radius,
        radius,
        GEOMETRY_HEIGHT,
        RADIAL_SEGMENTS,
      ),
    [radius],
  );

  const materials = useMemo(
    () => ({
      tommy: new THREE.MeshStandardMaterial({
        map: tommyTex,
        normalMap,
        roughnessMap,
        metalness: 0,
      }),
      red: new THREE.MeshStandardMaterial({
        map: redTex,
        normalMap,
        roughnessMap,
        metalness: 0,
      }),
      yellow: new THREE.MeshStandardMaterial({
        map: yellowTex,
        normalMap,
        roughnessMap,
        metalness: 0,
      }),
    }),
    [tommyTex, redTex, yellowTex, normalMap, roughnessMap],
  );

  // free GPU resources when the layer unmounts
  useEffect(() => {
    return () => {
      geometry.dispose();
      materials.tommy.dispose();
      materials.red.dispose();
      materials.yellow.dispose();
    };
  }, [geometry, materials]);

  const items = useMemo<ItemData[]>(() => {
    const arr: ItemData[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        position: [
          Math.random() * xSpread * 2 - xSpread,
          // stagger the initial fall across the whole loop height so the screen
          // is populated from the first frame
          Math.random() * (TOP * 2) - TOP,
          Math.random() * (zRange[1] - zRange[0]) + zRange[0],
        ],
        // cylinder axis is Y by default (disc faces up/down); rotate ~90° about
        // X so the flat record face points at the camera (+Z). Add a random
        // tilt on each axis so every vinyl faces the camera at its own angle.
        rotation: [
          Math.PI / 2 + (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          Math.random() * Math.PI,
        ],
        // gentle, per-vinyl fall speed (world units/sec)
        fallSpeed: Math.random() * 0.4 + 0.6,
        variant: variantForIndex(i),
      });
    }
    return arr;
  }, [count, xSpread, zRange]);

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[1, 0, 0]} intensity={30} color="#FFA5cc" />
      <pointLight position={[0, 1, 0]} intensity={30} color="#55A5ff" />
      <pointLight position={[0, 0, 1]} intensity={30} color="#cccca5" />
      {items.map((item, i) => (
        <Vinyl
          key={i}
          item={item}
          geometry={geometry}
          material={materials[item.variant]}
        />
      ))}
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 868);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const CANVAS_PROPS = {
  flat: true,
  gl: { antialias: false, powerPreference: 'high-performance' as const },
  dpr: [1, 1.5] as [number, number],
  camera: {
    position: [0, 0, CAMERA_Z] as [number, number, number],
    fov: 20,
    near: 0.01,
    far: 95,
  },
};

/** Vinyls behind the page content (h1, video, concerts). Hoverable. Gets the
 *  Noise + Vignette postprocessing pass on desktop (skipped on mobile to keep
 *  frame rate healthy on high-DPR phones). */
export default function Background() {
  const isMobile = useIsMobile();
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-background filter">
      <Canvas {...CANVAS_PROPS}>
        <VinylLayer
          count={isMobile ? 18 : 28}
          radius={0.6}
          xSpread={isMobile ? 3 : 7}
          zRange={[-2, 2]}
        />
        {!isMobile && (
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <Noise opacity={0.06} />
            <Vignette darkness={0.7} offset={0.35} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

/** Vinyls in front of the page content — closer to camera (z>0) so they pass
 *  over the h1 for parallax depth, and hoverable (faster spin on hover).
 *  pointer-events reach this canvas everywhere except over the iframe/concerts,
 *  which sit above it via z-index in page.tsx. */
export function Foreground() {
  const isMobile = useIsMobile();
  return (
    <div className="absolute inset-0 z-10 h-full w-full overflow-hidden">
      <Canvas {...CANVAS_PROPS}>
        <VinylLayer
          count={isMobile ? 4 : 7}
          radius={0.6}
          xSpread={isMobile ? 2 : 4}
          zRange={[2.5, 4.5]}
        />
      </Canvas>
    </div>
  );
}

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md bg-white bg-opacity-20 p-2 transition-all hover:bg-opacity-30"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-md bg-white bg-opacity-90 shadow-lg">
          <ul className="py-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Music
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
