'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { Float, Effects, Environment } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { Mesh } from 'three';
import { Menu } from 'lucide-react';
import { Physics, useCylinder } from '@react-three/cannon';

function Box({
  initialPosition,
  index,
}: {
  initialPosition: [number, number, number];
  isVinyl?: boolean;
  index: number;
}) {
  const [ref, api] = useCylinder(() => ({
    mass: 1,
    position: initialPosition,
    rotation: [
      Math.random() * Math.PI,
      Math.random() * Math.PI,
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

  const speed = useMemo(() => Math.random() * 10 + 40, []);
  const rotationSpeed = speed / 1000;
  useEffect(() => {
    // api.velocity.set(0, 0, speed);
    api.applyForce(
      [0, -speed, 1],
      [rotationSpeed, rotationSpeed, rotationSpeed],
    );
  }, []);

  api.position.subscribe(([x, y, z]) => {
    if (y < -4) {
      api.position.set(x, 4, z);
    }
  });

  // useFrame((state) => {
  // if (!ref.current) return;
  // Check the y position and reset if necessary
  // api.position.subscribe(([x, y, z]) => {
  //   if (y < -4) {
  //     api.position.set(x, 4, z);
  //   }
  // });

  // ref.current.rotation.x += 0.2;
  // ref.current.rotation.y += 0.2;

  // apply force to rotate

  // api.applyForce([0, -0.1, 0], [0, 0, 0]);

  // });

  return (
    // <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
    <mesh
      ref={ref}
      rotation={[
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ]}
    >
      <cylinderGeometry args={[0.6, 0.6, 0.0001, 32]} />
      <meshStandardMaterial
        map={texture}
        normalMap={normalMap}
        roughnessMap={roughtnessMap}
        metalness={0}
      />
    </mesh>
    // </Float>
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
    for (let i = 0; i < 40; i++) {
      pos.push([
        isMobile ? Math.random() * 5 : Math.random() * 10 - 5,
        isMobile ? Math.random() * 3 : Math.random() * 10,
        isMobile ? Math.random() * 5 : Math.random() * 10 - 5,
      ]);
    }
    return pos;
  }, [isMobile]) as [number, number, number][];

  // If the current position of the item has y less than -10, then position it on the y 10

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Environment preset="sunset" />
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
  const depth = 80;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-background filter">
      <Canvas
        flat
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
      >
        <Physics gravity={[0, 0, 0]}>
          <Scene />
        </Physics>
        <Effects>
          <EffectComposer multisampling={0}>
            <DepthOfField
              target={[0, 0, 2]}
              focalLength={0.05}
              bokehScale={3}
              height={1200}
            />
          </EffectComposer>
        </Effects>
      </Canvas>
      {/* <HamburgerMenu /> */}
    </div>
  );
}
