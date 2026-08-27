'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FRAME_COUNT = 240;
const LERP_FACTOR = 0.08;
const IMAGE_ASPECT = 1920 / 1080; // Loom frame aspect ratio

function framePath(i: number): string {
  const num = String(i + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${num}.jpg`;
}

interface FramePlaneProps {
  progress: number;
  textures: (THREE.Texture | null)[];
}

function FramePlane({ progress, textures = [] }: FramePlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentFrameRef = useRef(0);
  const { viewport } = useThree();

  // Compute cover-fit scale to fill the screen seamlessly
  const { scaleX, scaleY } = useMemo(() => {
    const viewportAspect = viewport.width / viewport.height;
    let sx = viewport.width;
    let sy = viewport.height;

    if (viewportAspect > IMAGE_ASPECT) {
      sx = viewport.width;
      sy = viewport.width / IMAGE_ASPECT;
    } else {
      sy = viewport.height;
      sx = viewport.height * IMAGE_ASPECT;
    }

    return { scaleX: sx, scaleY: sy };
  }, [viewport.width, viewport.height]);

  useFrame(() => {
    if (!meshRef.current || !textures || textures.length === 0) return;

    const targetFrame = Math.round(progress * (FRAME_COUNT - 1));
    currentFrameRef.current += (targetFrame - currentFrameRef.current) * LERP_FACTOR;

    const frameIdx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current)));
    const targetTexture = (textures && textures[frameIdx]) || (textures && textures[0]);

    if (targetTexture && meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      if (material.map !== targetTexture) {
        material.map = targetTexture;
        material.needsUpdate = true;
      }
    }
  });

  const initialTexture = textures && textures.length > 0 ? textures[0] : null;
  if (!initialTexture) return null;

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={initialTexture} toneMapped={false} />
    </mesh>
  );
}

interface ScrollCanvasProps {
  progress: number;
  onLoadProgress?: (pct: number) => void;
  onLoaded?: () => void;
}

export default function ScrollCanvas({ progress, onLoadProgress, onLoaded }: ScrollCanvasProps) {
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    const loadedTextures: (THREE.Texture | null)[] = new Array(FRAME_COUNT).fill(null);
    let loadedCount = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      loader.load(
        framePath(i),
        (tex) => {
          if (!isMounted) return;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;
          loadedTextures[i] = tex;
          loadedCount++;

          const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
          if (onLoadProgress) onLoadProgress(pct);

          // Update state when first texture or all textures are ready
          if (i === 0 || loadedCount === 1 || loadedCount % 10 === 0 || loadedCount === FRAME_COUNT) {
            setTextures([...loadedTextures]);
          }

          if (loadedCount === FRAME_COUNT && onLoaded) {
            onLoaded();
          }
        },
        undefined,
        (err) => {
          console.warn(`Failed to load frame ${i}:`, err);
          loadedCount++;
        }
      );
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const hasFrame0 = Boolean(textures && textures[0]);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100vw', height: '100vh', background: '#1a140e' }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a140e']} />
      {hasFrame0 && (
        <FramePlane progress={progress} textures={textures} />
      )}
    </Canvas>
  );
}
