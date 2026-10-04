'use client';

import { useEffect, useRef } from 'react';

interface FlowerParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAngle: number;
  swayRadius: number;
  rotation: number;
  rotSpeed: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  maxOpacity: number;
  type: 'jasmine' | 'blossom' | 'gold-butti' | 'petal' | 'pollen';
  colorTheme: {
    petalColor: string;
    petalGradient: string;
    centerColor: string;
    accentColor: string;
  };
}

export default function FloralMotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for gentle wind breeze interaction
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Color palettes for Indian luxury heritage flora
    const themes = [
      // Royal Jasmine (Mogra)
      {
        petalColor: 'rgba(255, 252, 245, 0.85)',
        petalGradient: 'rgba(247, 238, 220, 0.75)',
        centerColor: '#D4AF37',
        accentColor: 'rgba(179, 137, 56, 0.4)',
      },
      // Blush Rose Silk Blossom
      {
        petalColor: 'rgba(255, 240, 243, 0.82)',
        petalGradient: 'rgba(248, 204, 212, 0.72)',
        centerColor: '#C45A6D',
        accentColor: 'rgba(140, 29, 47, 0.35)',
      },
      // Zari Gold Lotus Florets
      {
        petalColor: 'rgba(250, 240, 215, 0.88)',
        petalGradient: 'rgba(224, 185, 107, 0.75)',
        centerColor: '#B38938',
        accentColor: 'rgba(179, 137, 56, 0.5)',
      },
      // Soft Sandalwood Cream Petals
      {
        petalColor: 'rgba(255, 250, 240, 0.85)',
        petalGradient: 'rgba(235, 220, 195, 0.7)',
        centerColor: '#C98B2C',
        accentColor: 'rgba(201, 101, 23, 0.3)',
      },
    ];

    const types: ('jasmine' | 'blossom' | 'gold-butti' | 'petal' | 'pollen')[] = [
      'jasmine',
      'blossom',
      'gold-butti',
      'petal',
      'petal',
      'pollen',
    ];

    // Flower particle count (balanced for breathtaking aesthetics & 60fps performance)
    const PARTICLE_COUNT = Math.min(48, Math.max(26, Math.floor(window.innerWidth / 38)));

    const createFlower = (randomY = false): FlowerParticle => {
      const type = types[Math.floor(Math.random() * types.length)];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      
      // Delicate small sizes between 8px and 20px (pollen is smaller: 2-4px)
      let size = Math.random() * 10 + 9;
      if (type === 'petal') size = Math.random() * 8 + 7;
      if (type === 'pollen') size = Math.random() * 2.5 + 1.8;

      const maxOpacity = type === 'pollen' ? Math.random() * 0.4 + 0.3 : Math.random() * 0.45 + 0.45;

      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -30 - Math.random() * 60,
        size,
        speedY: Math.random() * 0.55 + 0.35,
        speedX: (Math.random() - 0.5) * 0.3,
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayAngle: Math.random() * Math.PI * 2,
        swayRadius: Math.random() * 1.6 + 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        tilt: Math.random() * Math.PI,
        tiltSpeed: Math.random() * 0.02 + 0.008,
        opacity: randomY ? maxOpacity : 0,
        maxOpacity,
        type,
        colorTheme: theme,
      };
    };

    const flowers: FlowerParticle[] = Array.from({ length: PARTICLE_COUNT }, () => createFlower(true));

    // Helper to draw a 5-petal flower (Jasmine / Blossom)
    const draw5PetalFlower = (
      p: FlowerParticle,
      ctx: CanvasRenderingContext2D,
      petalCount = 5,
      isPointed = false
    ) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Simulate 3D tilt fluttering
      const scaleY = Math.cos(p.tilt) * 0.4 + 0.6;
      ctx.scale(1, scaleY);
      ctx.globalAlpha = p.opacity;

      const radius = p.size;
      const theme = p.colorTheme;

      // Draw petals
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI) / petalCount;
        ctx.save();
        ctx.rotate(angle);

        // Petal Gradient
        const grad = ctx.createRadialGradient(0, radius * 0.5, 0, 0, radius * 0.5, radius * 0.8);
        grad.addColorStop(0, theme.petalColor);
        grad.addColorStop(0.7, theme.petalGradient);
        grad.addColorStop(1, theme.accentColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);

        if (isPointed) {
          // Jasmine pointed petal
          ctx.quadraticCurveTo(radius * 0.35, radius * 0.5, 0, radius * 1.1);
          ctx.quadraticCurveTo(-radius * 0.35, radius * 0.5, 0, 0);
        } else {
          // Rounded blossom petal
          ctx.bezierCurveTo(radius * 0.45, radius * 0.3, radius * 0.4, radius * 0.9, 0, radius * 0.95);
          ctx.bezierCurveTo(-radius * 0.4, radius * 0.9, -radius * 0.45, radius * 0.3, 0, 0);
        }

        ctx.fill();

        // Subtle petal vein
        ctx.strokeStyle = 'rgba(179, 137, 56, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.15);
        ctx.lineTo(0, radius * 0.7);
        ctx.stroke();

        ctx.restore();
      }

      // Golden Center Pistil / Core
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = theme.centerColor;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fill();

      // Tiny center stamens
      ctx.fillStyle = '#FFE699';
      for (let j = 0; j < 4; j++) {
        const a = (j * Math.PI) / 2;
        const dist = radius * 0.12;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, radius * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper to draw single drifting silk petal
    const drawSinglePetal = (p: FlowerParticle, ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const scaleY = Math.cos(p.tilt) * 0.5 + 0.5;
      ctx.scale(1, scaleY);
      ctx.globalAlpha = p.opacity;

      const r = p.size;
      const theme = p.colorTheme;

      const grad = ctx.createLinearGradient(-r * 0.4, -r, r * 0.4, r);
      grad.addColorStop(0, theme.petalColor);
      grad.addColorStop(0.6, theme.petalGradient);
      grad.addColorStop(1, theme.accentColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.7, -r * 0.5, r * 0.6, r * 0.6, 0, r);
      ctx.bezierCurveTo(-r * 0.6, r * 0.6, -r * 0.7, -r * 0.5, 0, -r);
      ctx.fill();

      // Soft center vein
      ctx.strokeStyle = 'rgba(179, 137, 56, 0.3)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.quadraticCurveTo(r * 0.1, 0, 0, r * 0.75);
      ctx.stroke();

      ctx.restore();
    };

    // Helper to draw Golden Zari Floral Butti
    const drawZariButti = (p: FlowerParticle, ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const scaleY = Math.cos(p.tilt) * 0.4 + 0.6;
      ctx.scale(1, scaleY);
      ctx.globalAlpha = p.opacity;

      const r = p.size;
      ctx.fillStyle = 'rgba(218, 165, 32, 0.4)';
      ctx.strokeStyle = '#B38938';
      ctx.lineWidth = 0.8;

      // 4-leaf royal diamond butti
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.3, r * 0.5, 0, r);
        ctx.quadraticCurveTo(-r * 0.3, r * 0.5, 0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Golden center
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();

      ctx.restore();
    };

    // Helper to draw Pollen / Golden Shimmer
    const drawPollen = (p: FlowerParticle, ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#F5D77F';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.restore();
    };

    // Animation Loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      flowers.forEach((flower) => {
        // Update angles
        flower.swayAngle += flower.swaySpeed;
        flower.rotation += flower.rotSpeed;
        flower.tilt += flower.tiltSpeed;

        // Base sway movement (gentle horizontal breeze)
        const swayX = Math.sin(flower.swayAngle) * flower.swayRadius;
        flower.x += flower.speedX + swayX;
        flower.y += flower.speedY;

        // Subtle interactive mouse deflection (gentle breeze push)
        const dx = flower.x - mouseX;
        const dy = flower.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          flower.x += (dx / dist) * force * 1.5;
          flower.y += (dy / dist) * force * 1.2;
          flower.rotation += (dx > 0 ? 1 : -1) * force * 0.03;
        }

        // Fade in when entering from top
        if (flower.opacity < flower.maxOpacity) {
          flower.opacity = Math.min(flower.maxOpacity, flower.opacity + 0.02);
        }

        // Wrap around bottom to top
        if (flower.y > height + 40) {
          flower.y = -30 - Math.random() * 20;
          flower.x = Math.random() * width;
          flower.opacity = 0;
        }

        // Wrap around sides
        if (flower.x < -40) flower.x = width + 30;
        if (flower.x > width + 40) flower.x = -30;

        // Render flower based on type
        switch (flower.type) {
          case 'jasmine':
            draw5PetalFlower(flower, ctx, 5, true);
            break;
          case 'blossom':
            draw5PetalFlower(flower, ctx, 5, false);
            break;
          case 'gold-butti':
            drawZariButti(flower, ctx);
            break;
          case 'petal':
            drawSinglePetal(flower, ctx);
            break;
          case 'pollen':
            drawPollen(flower, ctx);
            break;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Gentle ambient luxury gold & ivory warmth gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          background: 'radial-gradient(circle, rgba(235, 215, 175, 0.22) 0%, rgba(250, 248, 245, 0) 70%)',
          filter: 'blur(50px)',
          borderRadius: '50%',
          animation: 'floatingGlow 18s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '2%',
          width: '45vw',
          height: '45vw',
          maxWidth: '550px',
          maxHeight: '550px',
          background: 'radial-gradient(circle, rgba(245, 210, 218, 0.18) 0%, rgba(250, 248, 245, 0) 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          animation: 'floatingGlow 22s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Floating Canvas with Small Delicate Flowers */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      <style jsx global>{`
        @keyframes floatingGlow {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(25px, 20px) scale(1.08);
          }
          100% {
            transform: translate(-20px, -15px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
