'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import Preloader from '@/components/landing/Preloader';
import Overlays from '@/components/landing/Overlays';
import ScrollCue from '@/components/landing/ScrollCue';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeaturedShowcase from '@/components/landing/FeaturedShowcase';
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

  // Auto-dismiss preloader as soon as initial frames load or after 1.2s fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleProgress = (pct: number) => {
    setLoadProgress(pct);
    if (pct >= 10) {
      setIsLoaded(true);
    }
  };

  return (
    <>
      <Preloader progress={loadProgress} isLoaded={isLoaded} />

      {/* Floating Top Luxury Navbar */}
      <LandingNavbar />

      {/* 3D Weaving Loom Scroll Canvas */}
      <section ref={sectionRef} className="scroll-section">
        <div className="sticky-viewport">
          <Suspense fallback={null}>
            <ScrollCanvas
              progress={progress}
              onLoadProgress={handleProgress}
              onLoaded={() => setIsLoaded(true)}
            />
          </Suspense>

          <Overlays progress={progress} />
          <ScrollCue visible={progress < 0.04} />
        </div>
      </section>

      {/* Luxury Saree Showcase & Direct Shop Gateway */}
      <FeaturedShowcase />

      <Footer />
    </>
  );
}
