'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface SareeDesign {
  id: number;
  craftRegion: string;
  weaveStyle: string;
  paletteName: string;
  baseGradient: string;
  zariTone: string;
  zariAccent: string;
  bodyPatternSvg: string;
  palluType: 'banarasi_kalka' | 'kanchi_temple' | 'paithani_peacock' | 'mysore_zari' | 'chanderi_ashrafi' | 'patola_ikkat';
  leftPercent: number;
  widthVw: number;
  lengthVh: number;
  rotationStart: number;
  rotationSettle: number;
  driftX: number;
  dropDelay: number;
  dropDuration: number;
  zIndex: number;
}

const SAREE_MASTERPIECES = [
  {
    craftRegion: 'Varanasi',
    weaveStyle: 'Kadhwa Floral Jaal',
    paletteName: 'Imperial Crimson Maroon',
    baseGradient: 'linear-gradient(155deg, #420612 0%, #7A1226 45%, #3D0410 100%)',
    zariTone: '#F5D77F',
    zariAccent: '#FFEBA0',
    palluType: 'banarasi_kalka' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23f5d77f' stroke-width='0.8' opacity='0.75'%3E%3Cpath d='M24 0 C32 12 44 12 48 24 C36 28 36 40 24 48 C12 36 12 28 0 24 C12 12 16 12 24 0Z'/%3E%3Ccircle cx='24' cy='24' r='2.5' fill='%23ffe89e'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    craftRegion: 'Kanchipuram',
    weaveStyle: 'Temple Korvai & Mayil',
    paletteName: 'Emerald Green & Scarlet',
    baseGradient: 'linear-gradient(155deg, #05261C 0%, #0C543E 45%, #041F16 100%)',
    zariTone: '#F8E7A2',
    zariAccent: '#FFF5C2',
    palluType: 'kanchi_temple' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='0' y='0' width='40' height='40' fill='none' stroke='%23f8e7a2' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23f8e7a2' opacity='0.85'/%3E%3C/svg%3E")`,
  },
  {
    craftRegion: 'Yeola',
    weaveStyle: 'Mor-Bangadi Paithani',
    paletteName: 'Royal Tapestry Magenta',
    baseGradient: 'linear-gradient(155deg, #44062E 0%, #87135C 45%, #350424 100%)',
    zariTone: '#FCD975',
    zariAccent: '#FFF1B5',
    palluType: 'paithani_peacock' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cg fill='%23fcd975' opacity='0.85'%3E%3Cpath d='M22 13 L24 20 L31 22 L24 24 L22 31 L20 24 L13 22 L20 20 Z' fill='%23ffe89e'/%3E%3Ccircle cx='22' cy='22' r='2' fill='%23d4af37'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    craftRegion: 'Mysore',
    weaveStyle: 'Pure Gold Zari Crepe',
    paletteName: 'Deep Sapphire Blue',
    baseGradient: 'linear-gradient(155deg, #07152F 0%, #133A78 45%, #051024 100%)',
    zariTone: '#F3DB83',
    zariAccent: '#FFF4C7',
    palluType: 'mysore_zari' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%23f3db83' stroke-width='0.7' fill='none' opacity='0.75'%3E%3Ccircle cx='24' cy='24' r='11' stroke-dasharray='2,2'/%3E%3Ccircle cx='24' cy='24' r='2.2' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    craftRegion: 'Chanderi',
    weaveStyle: 'Ashrafi Meenakari Tissue',
    paletteName: 'Antique Saffron Gold',
    baseGradient: 'linear-gradient(155deg, #6E2203 0%, #B84714 45%, #521802 100%)',
    zariTone: '#FFDF79',
    zariAccent: '#FFF8D9',
    palluType: 'chanderi_ashrafi' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'%3E%3Ccircle cx='21' cy='21' r='7' fill='none' stroke='%23ffdf79' stroke-width='0.7' opacity='0.65'/%3E%3Ccircle cx='21' cy='21' r='2' fill='%23fff'/%3E%3C/svg%3E")`,
  },
  {
    craftRegion: 'Patan',
    weaveStyle: 'Double Ikkat Navratna',
    paletteName: 'Patola Peacock Teal',
    baseGradient: 'linear-gradient(155deg, #042529 0%, #0F575F 45%, #031B1E 100%)',
    zariTone: '#F4D276',
    zariAccent: '#FFF1BC',
    palluType: 'patola_ikkat' as const,
    bodyPatternSvg: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg stroke='%23f4d276' stroke-width='0.8' fill='none' opacity='0.8'%3E%3Cpolygon points='20,2 38,20 20,38 2,20'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23f4d276'/%3E%3C/g%3E%3C/svg%3E")`,
  },
];

interface Props {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export default function SilkCascadeIntro({ onComplete, forcePlay = false }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Enable animation on page load
    setIsVisible(true);
    setIsFadingOut(false);

    // Snappy, luxurious 2.6s complete lifecycle
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2600);

    return () => clearTimeout(timer);
  }, [forcePlay]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 400);
  };

  // 6 Dramatic, organic, asymmetrical cascading drapes
  const sarees: SareeDesign[] = useMemo(() => {
    const layout = [
      { left: -8, width: 32, length: 142, rotStart: -7, rotEnd: -4.5, driftX: 18, delay: 0.0, z: 1 },
      { left: 14, width: 30, length: 148, rotStart: 5.5, rotEnd: 3.2, driftX: -14, delay: 0.07, z: 3 },
      { left: 34, width: 35, length: 154, rotStart: -2.5, rotEnd: -0.8, driftX: 6, delay: 0.15, z: 6 }, // Center Hero Paithani
      { left: 56, width: 31, length: 146, rotStart: 6, rotEnd: 3.8, driftX: -16, delay: 0.22, z: 4 },
      { left: 74, width: 33, length: 140, rotStart: -6.5, rotEnd: -4.2, driftX: 20, delay: 0.30, z: 2 },
      { left: -2, width: 28, length: 136, rotStart: 4, rotEnd: 2.1, driftX: -10, delay: 0.38, z: 5 },  // Flank layer
    ];

    return SAREE_MASTERPIECES.map((template, i) => {
      const cfg = layout[i];
      return {
        id: i,
        craftRegion: template.craftRegion,
        weaveStyle: template.weaveStyle,
        paletteName: template.paletteName,
        baseGradient: template.baseGradient,
        zariTone: template.zariTone,
        zariAccent: template.zariAccent,
        bodyPatternSvg: template.bodyPatternSvg,
        palluType: template.palluType,
        leftPercent: cfg.left,
        widthVw: cfg.width,
        lengthVh: cfg.length,
        rotationStart: cfg.rotStart,
        rotationSettle: cfg.rotEnd,
        driftX: cfg.driftX,
        dropDelay: cfg.delay,
        dropDuration: 1.15,
        zIndex: cfg.z,
      };
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'auto',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, rgba(20, 14, 10, 0.6) 0%, rgba(10, 6, 4, 0.85) 100%)',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Skip Button */}
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 100000,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid var(--gold)',
          borderRadius: '3px',
          padding: '7px 20px',
          color: '#1a130d',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.15s ease',
        }}
      >
        Skip ✕
      </button>

      {/* Royal Seal Emblem (Focal Centerpiece) */}
      <div
        className="royal-seal-emblem"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          textAlign: 'center',
          pointerEvents: 'none',
          animation: 'sealRevealOrganic 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Subtle glowing halo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '420px',
            height: '240px',
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        <span
          style={{
            display: 'block',
            fontSize: '0.88rem',
            letterSpacing: '0.35em',
            color: '#FFD700',
            textTransform: 'uppercase',
            fontWeight: 800,
            textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(212,175,55,0.6)',
          }}
        >
          ✦ SUTRAಧಾರ ✦
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            color: '#FFFFFF',
            fontWeight: 700,
            marginTop: '6px',
            textShadow: '0 4px 28px rgba(0,0,0,0.95)',
            letterSpacing: '0.04em',
          }}
        >
          Authentic Handloom Silk
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#FFF1BC',
            fontStyle: 'italic',
            marginTop: '6px',
            letterSpacing: '0.08em',
            textShadow: '0 2px 14px rgba(0,0,0,0.9)',
          }}
        >
          Varanasi • Kanchipuram • Yeola • Mysore • Chanderi • Patan
        </p>
      </div>

      {/* 6 Organic Asymmetrical Saree Drapes */}
      {sarees.map((saree) => (
        <div
          key={saree.id}
          className={`saree-cascade-drape saree-drape-${saree.id}`}
          style={{
            position: 'absolute',
            top: 0,
            left: `${saree.leftPercent}%`,
            width: `${saree.widthVw}vw`,
            height: `${saree.lengthVh}vh`,
            zIndex: saree.zIndex,
            animation: `sareeOrganicDrape${saree.id} 2.45s cubic-bezier(0.19, 1, 0.22, 1) ${saree.dropDelay}s forwards`,
          }}
        >
          {/* Main Saree Cloth Structure with Dynamic Pleat Shadow */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: saree.baseGradient,
              borderRadius: '0 0 16px 16px',
              boxShadow: '-8px 18px 36px rgba(0, 0, 0, 0.55), 6px 12px 24px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              transformOrigin: 'top center',
            }}
          >
            {/* Pattern Layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: saree.bodyPatternSvg,
                backgroundRepeat: 'repeat',
                opacity: 0.85,
              }}
            />

            {/* Left & Right Zari Selvedge Borders */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '12px',
                background: `linear-gradient(90deg, ${saree.zariTone} 0%, rgba(212,175,55,0.4) 100%)`,
                borderRight: `1px solid ${saree.zariTone}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '12px',
                background: `linear-gradient(-90deg, ${saree.zariTone} 0%, rgba(212,175,55,0.4) 100%)`,
                borderLeft: `1px solid ${saree.zariTone}`,
              }}
            />

            {/* Craft Origin Badge Attached to Drape */}
            <div
              style={{
                position: 'absolute',
                top: '18vh',
                left: '16px',
                right: '16px',
                background: 'rgba(15, 10, 6, 0.9)',
                border: `1px solid ${saree.zariTone}`,
                borderRadius: '6px',
                padding: '6px 10px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: saree.zariTone,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {saree.craftRegion}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display, serif)',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {saree.weaveStyle}
              </span>
            </div>

            {/* Rich Brocade Pallu End Panel (Bottom 170px) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '170px',
                background: `linear-gradient(to top, ${saree.zariTone} 0%, rgba(212,175,55,0.95) 45%, rgba(180,140,40,0.65) 85%, transparent 100%)`,
                borderTop: `2px solid ${saree.zariTone}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '10px 14px',
              }}
            >
              {/* Clean Geometric Vector Pallu Motifs */}
              {saree.palluType === 'kanchi_temple' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '7px solid transparent',
                          borderRight: '7px solid transparent',
                          borderBottom: '14px solid #540916',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
                    Gopuram Korvai
                  </span>
                </div>
              )}

              {saree.palluType === 'banarasi_kalka' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', background: '#3b1202', transform: 'rotate(45deg)' }} />
                    <div style={{ width: '12px', height: '12px', background: '#3b1202', transform: 'rotate(45deg)' }} />
                    <div style={{ width: '8px', height: '8px', background: '#3b1202', transform: 'rotate(45deg)' }} />
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                    Kalka Paisley Brocade
                  </span>
                </div>
              )}

              {saree.palluType === 'paithani_peacock' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#3b1202',
                          border: '1.5px solid #FCD975',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                    Mor-Bangadi Tapestry
                  </span>
                </div>
              )}

              {saree.palluType === 'mysore_zari' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#8c6818',
                          border: '1px solid #fff',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                    Pure Gold Crepe
                  </span>
                </div>
              )}

              {saree.palluType === 'chanderi_ashrafi' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '10px',
                          height: '10px',
                          background: '#5E1D03',
                          transform: 'rotate(45deg)',
                          border: '1px solid #FFDF79',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                    Meenakari Gold Tissue
                  </span>
                </div>
              )}

              {saree.palluType === 'patola_ikkat' && (
                <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '10px',
                          height: '10px',
                          background: '#042529',
                          transform: 'rotate(45deg)',
                          border: '1px solid #F4D276',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.15em', color: '#3b1202', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                    Navratna Ikkat Weave
                  </span>
                </div>
              )}

              {/* Tassels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  padding: '0 4px',
                }}
              >
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '3.5px',
                      height: '16px',
                      background: saree.zariAccent,
                      borderRadius: '1.5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3D Silk Pleat Crease Shadow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 14%, rgba(0,0,0,0.06) 50%, transparent 86%, rgba(0,0,0,0.35) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      ))}

      {/* Distinct Organic GPU Cascade Keyframes per Drape */}
      <style jsx global>{`
        /* Drape 0: Left Wing Sweeps In with Left Tilt */
        @keyframes sareeOrganicDrape0 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(-7deg);
            opacity: 0.95;
          }
          40% {
            transform: translate3d(18px, 0vh, 0) rotate(-4.5deg);
            opacity: 1;
          }
          65% {
            transform: translate3d(14px, -1.5vh, 0) rotate(-4deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(8px, -150vh, 0) rotate(-6deg);
            opacity: 0.9;
          }
        }

        /* Drape 1: Left Center Korvai with Right Tilt */
        @keyframes sareeOrganicDrape1 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(5.5deg);
            opacity: 0.95;
          }
          42% {
            transform: translate3d(-14px, 0vh, 0) rotate(3.2deg);
            opacity: 1;
          }
          66% {
            transform: translate3d(-10px, -2vh, 0) rotate(3deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(-6px, -150vh, 0) rotate(4.5deg);
            opacity: 0.9;
          }
        }

        /* Drape 2: Center Hero Paithani Cascades Down */
        @keyframes sareeOrganicDrape2 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(-2.5deg);
            opacity: 0.95;
          }
          38% {
            transform: translate3d(6px, 1.5vh, 0) rotate(-0.8deg);
            opacity: 1;
          }
          65% {
            transform: translate3d(4px, 0vh, 0) rotate(-0.5deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(2px, -152vh, 0) rotate(-1.5deg);
            opacity: 0.9;
          }
        }

        /* Drape 3: Right Center Sapphire Indigo with Right Tilt */
        @keyframes sareeOrganicDrape3 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(6deg);
            opacity: 0.95;
          }
          44% {
            transform: translate3d(-16px, 0vh, 0) rotate(3.8deg);
            opacity: 1;
          }
          67% {
            transform: translate3d(-12px, -1.8vh, 0) rotate(3.5deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(-8px, -150vh, 0) rotate(5deg);
            opacity: 0.9;
          }
        }

        /* Drape 4: Right Flank Saffron Sunburst */
        @keyframes sareeOrganicDrape4 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(-6.5deg);
            opacity: 0.95;
          }
          42% {
            transform: translate3d(20px, 0vh, 0) rotate(-4.2deg);
            opacity: 1;
          }
          66% {
            transform: translate3d(16px, -1.2vh, 0) rotate(-3.8deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(10px, -150vh, 0) rotate(-5.5deg);
            opacity: 0.9;
          }
        }

        /* Drape 5: Left Flank Deep Patola Teal */
        @keyframes sareeOrganicDrape5 {
          0% {
            transform: translate3d(0, -145vh, 0) rotate(4deg);
            opacity: 0.95;
          }
          45% {
            transform: translate3d(-10px, 0vh, 0) rotate(2.1deg);
            opacity: 1;
          }
          68% {
            transform: translate3d(-8px, -1.5vh, 0) rotate(1.8deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(-4px, -150vh, 0) rotate(3deg);
            opacity: 0.9;
          }
        }

        /* Grand Seal Reveal */
        @keyframes sealRevealOrganic {
          0% {
            opacity: 0;
            transform: translate(-50%, -42%) scale(0.92);
          }
          28% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          66% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.02);
          }
          86% {
            opacity: 0;
            transform: translate(-50%, -56%) scale(0.97);
          }
          100% {
            opacity: 0;
          }
        }

        .saree-cascade-drape {
          will-change: transform;
          transform: translate3d(0, -145vh, 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .saree-cascade-drape {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
