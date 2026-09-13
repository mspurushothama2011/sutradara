'use client';

import React, { useEffect, useRef } from 'react';

export default function InteractiveSilkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number;
    let isPaused = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Mouse coordinates with spring lerp
    const mouse = {
      x: width / 2,
      y: height / 3,
      targetX: width / 2,
      targetY: height / 3,
      radius: 200,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ── 1. Saree Handloom Loom Shuttles (Horizontal & Diagonal Weft Glides) ─
    const shuttles = [
      { yRatio: 0.22, speed: 1.2, x: 0, color: 'rgba(179, 137, 56, 0.65)', length: 180, zariTrail: 280 },
      { yRatio: 0.52, speed: -0.9, x: width, color: 'rgba(90, 104, 68, 0.6)', length: 220, zariTrail: 320 },
      { yRatio: 0.82, speed: 1.1, x: width * 0.3, color: 'rgba(212, 175, 55, 0.7)', length: 200, zariTrail: 300 },
    ];

    // ── 2. Draped Saree Pallu Panels (Realistic Draped Handloom Silks) ─────
    const sareeDrapes = [
      {
        baseX: -width * 0.08,
        widthPx: width * 0.38,
        angle: 12, // diagonal drape
        colorTop: 'rgba(122, 18, 38, 0.12)', // Royal Banarasi Crimson
        colorBottom: 'rgba(179, 137, 56, 0.08)',
        zariBorder: '#D4AF37',
        weaveType: 'kadhwa',
        phase: 0,
      },
      {
        baseX: width * 0.72,
        widthPx: width * 0.36,
        angle: -10, // opposing diagonal drape
        colorTop: 'rgba(12, 84, 62, 0.13)', // Kanchipuram Peacock Emerald
        colorBottom: 'rgba(90, 104, 68, 0.06)',
        zariBorder: '#F8E7A2',
        weaveType: 'korvai',
        phase: 2.5,
      },
    ];

    // ── 3. Shimmering Zari Thread Sparkles ─────────────────────────────────
    const sparkCount = width > 768 ? 24 : 14;
    const zariSparks = Array.from({ length: sparkCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.2 - Math.random() * 0.3,
      size: Math.random() * 2.5 + 1.2,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#FFD700' : '#F5D77F',
    }));

    let time = 0;

    const render = () => {
      if (isPaused) return;

      time += 0.014;

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // ══════════════════════════════════════════════════════════════════════
      // LAYER 1: HANDLOOM WARP THREADS (Vertical Silk Loom Grid)
      // ══════════════════════════════════════════════════════════════════════
      ctx.save();
      const warpSpacing = width > 768 ? 48 : 36;
      ctx.lineWidth = 0.5;

      for (let x = warpSpacing / 2; x < width; x += warpSpacing) {
        // Delicate shimmer along warp thread
        const threadShimmer = Math.sin(time * 1.2 + x * 0.02) * 0.04;
        const threadAlpha = 0.04 + Math.max(0, threadShimmer);

        ctx.beginPath();
        ctx.strokeStyle = x % (warpSpacing * 3) === 0 ? 'rgba(179, 137, 56, 0.12)' : 'rgba(90, 104, 68, 0.06)';
        ctx.globalAlpha = threadAlpha;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // ══════════════════════════════════════════════════════════════════════
      // LAYER 2: GLIDING WEFT LOOM SHUTTLES (Golden Zari Yarn Weaving in Real-Time)
      // ══════════════════════════════════════════════════════════════════════
      if (!prefersReducedMotion) {
        ctx.save();
        shuttles.forEach((shuttle) => {
          shuttle.x += shuttle.speed;
          if (shuttle.speed > 0 && shuttle.x > width + shuttle.zariTrail) {
            shuttle.x = -shuttle.zariTrail;
          } else if (shuttle.speed < 0 && shuttle.x < -shuttle.zariTrail) {
            shuttle.x = width + shuttle.zariTrail;
          }

          const y = height * shuttle.yRatio + Math.sin(time * 0.8 + shuttle.yRatio * 10) * 15;

          // Drawn Weft Zari Thread Trail (Gold Yarn pulled by shuttle)
          const trailGrad = ctx.createLinearGradient(
            shuttle.x - shuttle.length * Math.sign(shuttle.speed),
            y,
            shuttle.x,
            y
          );
          trailGrad.addColorStop(0, 'rgba(179, 137, 56, 0)');
          trailGrad.addColorStop(0.7, shuttle.color);
          trailGrad.addColorStop(1, '#FFE89E');

          ctx.beginPath();
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 1.8;
          ctx.moveTo(shuttle.x - shuttle.length * Math.sign(shuttle.speed), y);
          ctx.lineTo(shuttle.x, y);
          ctx.stroke();

          // Glowing Golden Shuttle Head (Diamond Pirn Shape)
          ctx.beginPath();
          ctx.fillStyle = '#FFF5C2';
          ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
          ctx.shadowBlur = 8;
          ctx.arc(shuttle.x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        ctx.restore();
      }

      // ══════════════════════════════════════════════════════════════════════
      // LAYER 3: VOLUMETRIC DRAPED SAREE PANELS (Diagonal Saree Silk & Zari Borders)
      // ══════════════════════════════════════════════════════════════════════
      sareeDrapes.forEach((drape) => {
        ctx.save();

        // Billowing silk drape physics
        const billow = Math.sin(time * 0.6 + drape.phase) * 20;
        const startX = drape.baseX + billow;
        const topWidth = drape.widthPx + Math.cos(time * 0.5 + drape.phase) * 15;

        // Draw Draped Saree Cloth
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.bezierCurveTo(
          startX + topWidth * 0.2,
          height * 0.4,
          startX - 20,
          height * 0.7,
          startX + (drape.angle * 8),
          height
        );
        ctx.lineTo(startX + topWidth + (drape.angle * 8), height);
        ctx.bezierCurveTo(
          startX + topWidth,
          height * 0.7,
          startX + topWidth + 30,
          height * 0.4,
          startX + topWidth,
          0
        );
        ctx.closePath();

        const drapeGrad = ctx.createLinearGradient(startX, 0, startX + topWidth, height);
        drapeGrad.addColorStop(0, drape.colorTop);
        drapeGrad.addColorStop(0.5, drape.colorBottom);
        drapeGrad.addColorStop(1, drape.colorTop);
        ctx.fillStyle = drapeGrad;
        ctx.fill();

        // ── Gold Zari Saree Border (Gopuram / Temple Tooth Border) ────
        ctx.beginPath();
        const borderX = startX + topWidth * 0.05;
        ctx.moveTo(borderX, 0);
        ctx.bezierCurveTo(
          borderX + topWidth * 0.2,
          height * 0.4,
          borderX - 20,
          height * 0.7,
          borderX + (drape.angle * 8),
          height
        );
        ctx.strokeStyle = drape.zariBorder;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Geometric Temple / Zari Butti Teeth along the saree border
        const stepCount = 12;
        ctx.fillStyle = drape.zariBorder;
        for (let i = 1; i < stepCount; i++) {
          const t = i / stepCount;
          const py = t * height;
          const px = borderX + Math.sin(t * Math.PI) * (topWidth * 0.15) + (drape.angle * 8 * t);

          ctx.beginPath();
          // Small Kanchipuram Korvai / Zari Triangle
          ctx.moveTo(px, py - 6);
          ctx.lineTo(px + 10, py);
          ctx.lineTo(px, py + 6);
          ctx.closePath();
          ctx.globalAlpha = 0.4;
          ctx.fill();
        }

        ctx.restore();
      });

      // ══════════════════════════════════════════════════════════════════════
      // LAYER 4: INTERACTIVE CURSOR GOLDEN ZARI HALO (Touching Silk Surface)
      // ══════════════════════════════════════════════════════════════════════
      const cursorFlare = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 1.5);
      cursorFlare.addColorStop(0, 'rgba(212, 175, 55, 0.20)');
      cursorFlare.addColorStop(0.4, 'rgba(90, 104, 68, 0.12)');
      cursorFlare.addColorStop(1, 'rgba(250, 248, 245, 0)');
      ctx.fillStyle = cursorFlare;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // ══════════════════════════════════════════════════════════════════════
      // LAYER 5: FLOATING 2G GOLD ZARI DUST & SPARKLES
      // ══════════════════════════════════════════════════════════════════════
      zariSparks.forEach((sp) => {
        if (!prefersReducedMotion) {
          sp.x += sp.vx + Math.sin(time + sp.phase) * 0.25;
          sp.y += sp.vy;

          // Mouse proximity push
          const dx = mouse.x - sp.x;
          const dy = mouse.y - sp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 1.5;
            sp.x -= (dx / dist) * force;
            sp.y -= (dy / dist) * force;
          }

          if (sp.y < 0) {
            sp.y = height;
            sp.x = Math.random() * width;
          }
          if (sp.x < 0) sp.x = width;
          if (sp.x > width) sp.x = 0;
        }

        const twinkle = Math.sin(time * 3 + sp.phase) * 0.3;
        const alpha = Math.max(0.15, Math.min(0.85, 0.45 + twinkle));

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
}
