'use client';

import { useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import Preloader from '@/components/landing/Preloader';
import Overlays from '@/components/landing/Overlays';
import ScrollCue from '@/components/landing/ScrollCue';
import Footer from '@/components/ui/Footer';

// Dynamic import ScrollCanvas to avoid SSR issues with Three.js
const ScrollCanvas = dynamic(
  () => import('@/components/landing/ScrollCanvas'),
  { ssr: false }
);

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Preloader progress={loadProgress} isLoaded={isLoaded} />

      <section ref={sectionRef} className="scroll-section">
        <div className="sticky-viewport">
          <Suspense fallback={null}>
            <ScrollCanvas
              progress={progress}
              onLoadProgress={setLoadProgress}
              onLoaded={() => setIsLoaded(true)}
            />
          </Suspense>

          <Overlays progress={progress} />
          <ScrollCue visible={progress < 0.04} />
        </div>
      </section>

      <Footer />
    </>
  );
}
