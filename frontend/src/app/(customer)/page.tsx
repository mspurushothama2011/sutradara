'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, Award, ShieldCheck, Lock, Video, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeaturedShowcase from '@/components/landing/FeaturedShowcase';
import SilkCascadeIntro from '@/components/intro/SilkCascadeIntro';
import FloralMotionBackground from '@/components/landing/FloralMotionBackground';

interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface ProductPreviewItem {
  id: string;
  name: string;
  images: string[];
  sellingPrice: number;
  slug: string;
  zariType?: string;
  fabric?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  region: string;
  description?: string | null;
  image?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  parentId?: string | null;
  children?: CategoryItem[];
  subCategories?: SubCategoryItem[];
  products?: ProductPreviewItem[];
  tag?: string;
  craft?: string;
}

const FALLBACK_CLUSTERS: CategoryItem[] = [
  {
    id: 'varanasi',
    name: 'Banarasi Heritage',
    region: 'Varanasi',
    slug: 'banarasi-heritage',
    craft: 'Royal Kadhwa & Tanchoi Brocades',
    description: 'Famed for Kadhwa, Tanchoi, and Jangla weaves in pure mulberry silk with pure gold & silver zari.',
    image: '/frames/ezgif-frame-240.jpg',
    isFeatured: true,
    displayOrder: 1,
    tag: 'Pure Gold Zari',
  },
  {
    id: 'kanchipuram',
    name: 'Kanjivaram Heritage',
    region: 'Kanchipuram',
    slug: 'kanjivaram-heritage',
    craft: '3-Ply Mulberry Korvai Silks',
    description: 'Renowned for 3-ply heavy mulberry silk with interlocking Korvai temple borders and petni pallus.',
    image: '/frames/ezgif-frame-180.jpg',
    isFeatured: true,
    displayOrder: 2,
    tag: 'Temple Borders',
  },
  {
    id: 'yeola',
    name: 'Paithani Heritage',
    region: 'Yeola',
    slug: 'paithani-heritage',
    craft: 'Kaleidoscope Peacock Pallus',
    description: 'The Queen of Silks featuring oblique square borders and handwoven kaleidoscope peacock pallus.',
    image: '/frames/ezgif-frame-150.jpg',
    isFeatured: true,
    displayOrder: 3,
    tag: 'Tapestry Weave',
  },
  {
    id: 'chanderi',
    name: 'Chanderi Heritage',
    region: 'Chanderi',
    slug: 'chanderi-heritage',
    craft: 'Featherlight Tissue & Organza',
    description: 'Featherlight tissue and pure organza silk sarees with gold and silver zari buttis.',
    image: '/frames/ezgif-frame-120.jpg',
    isFeatured: true,
    displayOrder: 4,
    tag: 'Gold Meenakari',
  },
];

const getCategoryImageUrl = (image?: string | null, index: number = 0) => {
  if (!image) {
    const fallbackFrames = [
      '/frames/ezgif-frame-240.jpg',
      '/frames/ezgif-frame-180.jpg',
      '/frames/ezgif-frame-150.jpg',
      '/frames/ezgif-frame-120.jpg',
      '/frames/ezgif-frame-090.jpg',
      '/frames/ezgif-frame-200.jpg',
      '/frames/ezgif-frame-060.jpg',
    ];
    return fallbackFrames[index % fallbackFrames.length];
  }
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/uploads/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:4000';
    return `${backendUrl}${image}`;
  }
  return image;
};

const getCategoryTag = (cat: CategoryItem) => {
  if (cat.tag) return cat.tag;
  if (cat.children && cat.children.length > 0) {
    return cat.children[0].name;
  }
  if (cat.subCategories && cat.subCategories.length > 0) {
    return cat.subCategories[0].name;
  }
  if (cat.region) return `${cat.region} Craft`;
  return 'Pure Silk Handloom';
};

function FeaturedCategoryCard({
  category,
  index,
}: {
  category: CategoryItem;
  index: number;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Distinct regional frame image mappings
  const REGION_FRAME_MAP: Record<string, string[]> = {
    varanasi: ['/frames/ezgif-frame-240.jpg', '/frames/ezgif-frame-220.jpg', '/frames/ezgif-frame-200.jpg'],
    kanchipuram: ['/frames/ezgif-frame-180.jpg', '/frames/ezgif-frame-170.jpg', '/frames/ezgif-frame-160.jpg'],
    yeola: ['/frames/ezgif-frame-150.jpg', '/frames/ezgif-frame-140.jpg', '/frames/ezgif-frame-130.jpg'],
    chanderi: ['/frames/ezgif-frame-120.jpg', '/frames/ezgif-frame-110.jpg', '/frames/ezgif-frame-100.jpg'],
    mysore: ['/frames/ezgif-frame-090.jpg', '/frames/ezgif-frame-080.jpg', '/frames/ezgif-frame-070.jpg'],
    patan: ['/frames/ezgif-frame-200.jpg', '/frames/ezgif-frame-190.jpg', '/frames/ezgif-frame-180.jpg'],
    bhagalpur: ['/frames/ezgif-frame-060.jpg', '/frames/ezgif-frame-050.jpg', '/frames/ezgif-frame-040.jpg'],
  };

  // Collect image slides from category.products or distinct regional frames
  const slides = useMemo(() => {
    const list: { image: string; title?: string; subtitle?: string; price?: number }[] = [];
    const regKey = (category.region || category.slug || '').toLowerCase();
    const regionalFrames = REGION_FRAME_MAP[regKey] || [
      '/frames/ezgif-frame-240.jpg',
      '/frames/ezgif-frame-180.jpg',
      '/frames/ezgif-frame-150.jpg',
      '/frames/ezgif-frame-120.jpg',
    ];

    // Category main banner image
    if (category.image) {
      list.push({
        image: getCategoryImageUrl(category.image, index),
        title: category.region || category.name.replace(/\s*Heritage|\s*Silk/gi, ''),
        subtitle: category.tag || category.craft || '100% Pure Silk',
      });
    }

    // Product images if available
    if (category.products && category.products.length > 0) {
      category.products.forEach((p) => {
        const prodImg = p.images && p.images.length > 0 ? p.images[0] : null;
        if (prodImg && !list.some((s) => s.image === prodImg)) {
          list.push({
            image: getCategoryImageUrl(prodImg, index),
            title: category.region || category.name.replace(/\s*Heritage|\s*Silk/gi, ''),
            subtitle: p.zariType || p.fabric || category.tag || 'Handloom Silk',
            price: p.sellingPrice,
          });
        }
      });
    }

    // Fallback padding if less than 3 slides using distinct regional frames
    let fbIdx = 0;
    while (list.length < 3) {
      list.push({
        image: regionalFrames[fbIdx % regionalFrames.length],
        title: category.region || category.name.replace(/\s*Heritage|\s*Silk/gi, ''),
        subtitle: category.tag || category.craft || 'Authentic Weave',
      });
      fbIdx++;
    }

    return list.slice(0, 4);
  }, [category, index]);

  const currentSlide = slides[activeSlide] || slides[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const targetHref = category.region
    ? `/catalog?craftRegion=${encodeURIComponent(category.region)}`
    : `/catalog?category=${encodeURIComponent(category.slug || category.id)}`;

  const displayName = category.region || category.name.replace(/\s*Heritage|\s*Silk/gi, '');
  const displaySubtitle = category.tag || currentSlide.subtitle || category.craft || 'Pure Silk Zari';

  return (
    <Link
      href={targetHref}
      style={{
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: '16 / 11',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        borderRadius: '3px',
        border: '1px solid rgba(179, 137, 56, 0.35)',
        boxShadow: '0 8px 30px rgba(26, 19, 13, 0.16)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(179, 137, 56, 0.3)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(179, 137, 56, 0.35)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(26, 19, 13, 0.16)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      {/* Background Saree Photography */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden',
          backgroundColor: '#1A130D',
        }}
      >
        <img
          key={currentSlide.image}
          src={currentSlide.image}
          alt={currentSlide.title || category.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
          }}
        />

        {/* Multi-tier luxury gradient overlay ensuring 100% text contrast & readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(16, 11, 7, 0.88) 0%, rgba(16, 11, 7, 0.35) 45%, rgba(16, 11, 7, 0.15) 65%, rgba(16, 11, 7, 0.88) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Top-Left: Crisp, High-Contrast Luxury Frosted Glass Badge Plate */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          alignSelf: 'flex-start',
          maxWidth: '85%',
        }}
      >
        <div
          style={{
            background: 'rgba(26, 19, 13, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(179, 137, 56, 0.45)',
            borderRadius: '10px',
            padding: '10px 16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
            display: 'inline-block',
          }}
        >
          <h3
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-display, Georgia, serif)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
            }}
          >
            {displayName}
          </h3>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#E5C07B',
              margin: '3px 0 0',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
              textTransform: 'uppercase',
            }}
          >
            ✦ {displaySubtitle}
          </p>
        </div>
      </div>

      {/* Bottom Controls Row: Luminous Diamond Dots & Glass Chevrons */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 3,
          paddingTop: '6px',
        }}
      >
        {/* Diamond Pagination Indicators in Frosted Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(26, 19, 13, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(179, 137, 56, 0.4)',
            borderRadius: '20px',
            padding: '6px 14px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
        >
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSlide(i);
              }}
              style={{
                display: 'inline-block',
                width: i === activeSlide ? '8px' : '6px',
                height: i === activeSlide ? '8px' : '6px',
                transform: 'rotate(45deg)',
                backgroundColor: i === activeSlide ? 'var(--gold)' : 'rgba(255, 255, 255, 0.35)',
                boxShadow: i === activeSlide ? '0 0 10px rgba(179, 137, 56, 0.9)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Circular Glass Chevron Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(26, 19, 13, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(179, 137, 56, 0.45)',
              color: '#FFFFFF',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(26, 19, 13, 0.75)';
              e.currentTarget.style.borderColor = 'rgba(179, 137, 56, 0.45)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(26, 19, 13, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(179, 137, 56, 0.45)',
              color: '#FFFFFF',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(26, 19, 13, 0.75)';
              e.currentTarget.style.borderColor = 'rgba(179, 137, 56, 0.45)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Next slide"
          >
            ›
          </button>
        </div>
      </div>
    </Link>
  );
}

const TRENDING_SEARCHES = [
  'Varanasi Kadhwa',
  'Mulberry Korvai',
  'Peacock Paithani',
  'Pure Gold Zari',
  'Chanderi Tissue',
  '1-of-1 Heirlooms',
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [replayKey, setReplayKey] = useState(0);
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CLUSTERS);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await apiRequest<{ categories?: CategoryItem[] }>('/categories');
        if (isMounted && res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories from database:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredTop4 = useMemo(() => {
    const featured = categories.filter((c) => c.isFeatured);
    if (featured.length >= 4) {
      return featured.slice(0, 4);
    }
    const nonFeatured = categories.filter((c) => !c.isFeatured);
    return [...featured, ...nonFeatured].slice(0, 4);
  }, [categories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  const handleTrendingClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text)', position: 'relative' }}>
      {/* 🌸 Royal Indian Heritage Small Flowers Motion Canvas Background */}
      <FloralMotionBackground />

      {/* 👘 Silk Saree Cascade Full-Screen Startup Animation */}
      <SilkCascadeIntro key={replayKey} forcePlay={replayKey > 0} />

      {/* Unified Luxury Navbar with Deal Countdown */}
      <LandingNavbar />

      {/* Grand Full-Screen Clean Minimalist Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '100px',
          paddingBottom: '40px',
          paddingLeft: '32px',
          paddingRight: '32px',
          overflow: 'hidden',
        }}
      >
        {/* Full-Screen Natural Sunlit Saree Hero Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            overflow: 'hidden',
            backgroundColor: '#FAF8F5',
          }}
        >
          <img
            src="/hero/hero-saree-showpiece-16-9.jpg"
            alt="Sutradara Handwoven Silk Saree"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right 25%',
            }}
          />

          {/* Minimal Soft Vignette only at the top for Navbar clarity (No Dark Gradient) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '140px',
              background: 'linear-gradient(180deg, rgba(250, 248, 245, 0.65) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Clean Hero Content Container: Minimal Brand & Logo Showcase */}
        <div
          style={{
            maxWidth: '1320px',
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Elegant Imperial Obsidian Frosted Glass Brand Card */}
          <div
            style={{
              maxWidth: '480px',
              textAlign: 'left',
              padding: '36px 40px',
              background: 'linear-gradient(145deg, rgba(28, 18, 12, 0.90) 0%, rgba(18, 11, 7, 0.86) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 24px 60px rgba(10, 6, 4, 0.45), 0 0 30px rgba(179, 137, 56, 0.15)',
            }}
          >
            {/* Logo Image Support */}
            <div style={{ marginBottom: '16px' }}>
              {!logoError ? (
                <img
                  src="/hero/logo-transparent.svg"
                  alt="House of Sutradara"
                  onError={() => setLogoError(true)}
                  style={{
                    maxHeight: '110px',
                    maxWidth: '320px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                />
              ) : (
                <div id="sutradara-hero-wordmark" style={{ display: 'block' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      letterSpacing: '0.35em',
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    HOUSE OF
                  </span>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                      color: '#FAF8F5',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      margin: '0',
                      lineHeight: 1.1,
                    }}
                  >
                    Sutradara
                  </h1>
                </div>
              )}
            </div>

            <p
              style={{
                fontSize: '0.84rem',
                letterSpacing: '0.24em',
                color: '#E6D5C3',
                textTransform: 'uppercase',
                fontWeight: 600,
                margin: '0 0 24px',
                lineHeight: 1.4,
              }}
            >
              Handwoven Pure Silk Heirlooms
            </p>

            <Link
              href="/catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 32px',
                background: 'var(--gold)',
                color: '#FFFFFF',
                border: '1px solid rgba(212, 175, 55, 0.6)',
                borderRadius: '3px',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(179, 137, 56, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#C49746';
                e.currentTarget.style.borderColor = '#C49746';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(179, 137, 56, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gold)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(179, 137, 56, 0.35)';
              }}
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Assurance Floating Strip */}
      <section style={{ padding: '0 24px', maxWidth: '1320px', margin: '-36px auto 40px', position: 'relative', zIndex: 4 }}>
        <div
          className="glass-card-luxury"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            padding: '28px 24px',
            borderRadius: '8px',
            boxShadow: '0 16px 40px rgba(26, 19, 13, 0.12)',
            border: '1px solid rgba(179, 137, 56, 0.3)',
            background: 'rgba(255, 255, 255, 0.94)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
              <ShieldCheck size={26} strokeWidth={1.25} />
            </div>
            <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Silk Mark 100%
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Govt. certified purity</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
              <Award size={26} strokeWidth={1.25} />
            </div>
            <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              1-of-1 Heirlooms
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>10-min uninterrupted cart hold</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
              <Video size={26} strokeWidth={1.25} />
            </div>
            <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Recorded Packing
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Pre-shipment verification video</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: 'var(--gold)', marginBottom: '8px' }}>
              <Truck size={26} strokeWidth={1.25} />
            </div>
            <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Insured Air Express
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Direct courier delivery</span>
          </div>
        </div>
      </section>

      {/* Interactive Saree Showcase with Live Filter & Quickview */}
      <FeaturedShowcase />

      {/* 4 Geographical Craft Clusters */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            TRADITIONAL WEAVING REGIONS
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', marginTop: '6px' }}>
            Iconic Handloom Weaving Regions
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '8px' }}>
            Handwoven directly by master artisans and weaver cooperatives
          </p>
        </div>

        {/* 2x2 Clean Minimalist Luxury Grid Layout (Exact Reference Match) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '16px',
            maxWidth: '1080px',
            margin: '0 auto',
          }}
        >
          {featuredTop4.map((cluster, idx) => (
            <FeaturedCategoryCard
              key={cluster.id || cluster.slug || cluster.name}
              category={cluster}
              index={idx}
            />
          ))}
        </div>

        {/* View All Categories Button */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link
            href="/categories"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.4)',
              borderRadius: '8px',
              color: 'var(--gold-dark)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.background = 'var(--gold)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(179, 137, 56, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = 'var(--gold-dark)';
            }}
          >
            <span>Explore All {categories.length || 8} Weaving Regions</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Curation Philosophy Banner */}
      <section
        style={{
          padding: '80px 24px',
          background: 'transparent',
          textAlign: 'center',
        }}
      >
        <div
          className="glass-card-luxury"
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '56px 36px',
            borderRadius: '16px',
          }}
        >
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            THE SUTRAಧಾರ PROMISE
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0 20px' }}>
            No Machine Copies. 100% Handwoven Silk.
          </h2>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.8, fontSize: '1rem', fontWeight: 400, maxWidth: '780px', margin: '0 auto' }}>
            We bring you certified genuine handloom sarees. Every piece is woven thread-by-thread on traditional wooden pit looms, tested for pure zari purity, and authenticated with Silk Mark India certification.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/authenticity"
              style={{
                padding: '14px 28px',
                background: 'var(--gold)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(179, 137, 56, 0.3)',
                display: 'inline-block',
              }}
            >
              Learn About Silk Mark Verification →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
