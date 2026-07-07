'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { Mesh, Vector3 } from 'three';
import { Menu } from 'lucide-react';
import { Physics, useCylinder } from '@react-three/cannon';

// Top of the fall loop. Camera (fov 20, z=10) sees roughly y ∈ [-2, 2] at the
// vinyls' depth, so spawn/recycle a little above the frame and fall through it.
const TOP = 3.5;
const CAMERA_Z = 10;

// reused scratch vector for the per-frame spin-axis calc (avoids per-frame alloc)
const SPIN_AXIS = new Vector3();

function Box({
  initialPosition,
  index,
}: {
  initialPosition: [number, number, number];
  isVinyl?: boolean;
  index: number;
}) {
  const [ref, api] = useCylinder<Mesh>(() => ({
    mass: 1,
    position: initialPosition,
    // cylinder axis is Y by default (disc faces up/down); rotate ~90° about X so
    // the flat record face points at the camera (+Z). Add a random tilt on each
    // axis so every vinyl faces the camera at its own slightly different angle.
    rotation: [
      Math.PI / 2 + (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      Math.random() * Math.PI,
    ],
    args: [0.6, 0.6, 0.001, 32],
    collisionFilter: {
      group: 1,
      category: 1,
      mask: 1,
    },
  }));

  const getVinlyTexture = () => {
    if (index % 4 === 0) {
      return '/images/vinylTommyYellow.png';
    }
    if (index % 3 === 0) {
      return '/images/vinylTommyRed.png';
    }
    return '/images/vinylTommy.png';
  };
  const texture = useLoader(TextureLoader, getVinlyTexture());
  const roughtnessMap = useLoader(TextureLoader, '/images/vinyl.jpg');
  const normalMap = useLoader(TextureLoader, '/images/normal.png');

  // gentle, per-vinyl fall speed (world units/sec) — slow enough to stay on
  // screen the whole way down instead of the old off-screen impulse
  const fallSpeed = useMemo(() => Math.random() * 0.4 + 0.6, []);
  const hovered = useRef(false);

  useEffect(() => {
    // constant downward velocity (no gravity in the world); recycle to the top
    // once below the visible band so vinyls fall on a continuous loop
    api.velocity.set(0, -fallSpeed, 0);
    const unsubPos = api.position.subscribe(([x, y, z]) => {
      if (y < -TOP) api.position.set(x, TOP, z);
    });
    return unsubPos;
  }, []);

  // Spin the record about its OWN face-normal axis (the cylinder's local Y), so
  // it turns like it's playing regardless of its tilt or where it is on screen.
  // Faster when hovered. angularVelocity is world-space, so map the local axis
  // through the current orientation each frame.
  useFrame(() => {
    api.velocity.set(0, -fallSpeed, 0);
    if (!ref.current) return;
    const rate = hovered.current ? 3 : 0.6;
    SPIN_AXIS.set(0, 1, 0).applyQuaternion(ref.current.quaternion).multiplyScalar(rate);
    api.angularVelocity.set(SPIN_AXIS.x, SPIN_AXIS.y, SPIN_AXIS.z);
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={() => (hovered.current = false)}
    >
      <cylinderGeometry args={[0.6, 0.6, 0.0001, 32]} />
      <meshStandardMaterial
        map={texture}
        normalMap={normalMap}
        roughnessMap={roughtnessMap}
        metalness={0}
      />
    </mesh>
  );
}

function Scene() {
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 868);
    };
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
  };
  const isMobile = useIsMobile();
  const positions = useMemo(() => {
    const pos = [];
    const xSpread = isMobile ? 3 : 7; // fill the width at this narrow fov
    for (let i = 0; i < 40; i++) {
      pos.push([
        Math.random() * xSpread * 2 - xSpread,
        // stagger the initial fall across the whole loop height so the screen
        // is populated from the first frame
        Math.random() * (TOP * 2) - TOP,
        Math.random() * 4 - 2, // keep vinyls near the focal plane (z≈0)
      ]);
    }
    return pos;
  }, [isMobile]) as [number, number, number][];

  // If the current position of the item has y less than -10, then position it on the y 10

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 0]} intensity={50} color="#FFA5cc" />
      {positions.map((position, index) => (
        <Box key={index} initialPosition={position} isVinyl index={index} /> // = { index % 4 === 0}
      ))}
    </>
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

export default function Background() {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-background filter">
      <Canvas
        flat
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAMERA_Z], fov: 20, near: 0.01, far: 95 }}
      >
        <Physics gravity={[0, 0, 0]}>
          <Scene />
        </Physics>
      </Canvas>
      {/* <HamburgerMenu /> */}
    </div>
  );
}
