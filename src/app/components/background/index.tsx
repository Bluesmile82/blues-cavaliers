'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { Float, Effects, Environment } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { Mesh } from 'three';
import { Menu } from 'lucide-react';

function Box({
  initialPosition,
  isVinyl = false,
}: {
  initialPosition: [number, number, number];
  isVinyl?: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(
    TextureLoader,
    isVinyl
      ? '/images/cavalierslogo.png?height=200&width=200'
      : '/images/cavalierslogo.png',
  );
  const speed = useMemo(() => Math.random() * 0.02 + 0.005, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.position.y -= speed;

    if (meshRef.current.position.y < -15) {
      meshRef.current.position.y = 15;
    }
  });

  if (isVinyl) {
    return (
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={meshRef}
          position={initialPosition}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ]}
        >
          <cylinderGeometry args={[0.6, 0.6, 0.01, 32]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.3} />
        </mesh>
      </Float>
    );
  }

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        position={initialPosition}
        rotation={[
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ]}
      >
        <boxGeometry args={[1.2, 3.6, 0.3]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.3} />
      </mesh>
    </Float>
  );
}

function Scene() {
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 50; i++) {
      pos.push([
        Math.random() * 10 - 5,
        Math.random() * 10,
        Math.random() * 10 - 5,
      ]);
    }
    return pos;
  }, []) as [number, number, number][];
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Environment preset="sunset" />
      {/* <spotLight position={[10, 20, 10]} penumbra={1} decay={0} intensity={3} color="orange" /> */}
      <pointLight position={[0, 0, 0]} intensity={100} color="#FFA5cc" />
      {/* <pointLight position={[0, 1, 5]} intensity={200} color="purple" /> */}
      {positions.map((position, index) => (
        <Box key={index} initialPosition={position} isVinyl /> // = { index % 4 === 0}
      ))}
      {/* <OrbitControls enableZoom={false} enablePan enableRotate /> */}
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
    <div className="sepia-animate absolute inset-0 h-full w-full overflow-hidden bg-background filter">
      <Canvas
        flat
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
      >
        <Scene />
        <Effects>
          <EffectComposer multisampling={0}>
            <DepthOfField
              target={[0, 0, 8]}
              focalLength={0.2}
              bokehScale={5}
              height={800}
            />
          </EffectComposer>
        </Effects>
      </Canvas>
      {/* <HamburgerMenu /> */}
    </div>
  );
}
