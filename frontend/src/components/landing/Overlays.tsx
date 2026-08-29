'use client';

interface OverlaysProps {
  progress: number;
}

interface OverlayData {
  id: string;
  className: string;
  kicker: string;
  headline: string;
  body: string;
  start: number;
  end: number;
  cta?: { text: string; href: string };
}

const overlays: OverlayData[] = [
  {
    id: 'ov-intro',
    className: 'ov-intro',
    kicker: 'SUTRAಧಾರ',
    headline: 'From the Loom<br/>to Your Legacy',
    body: 'Scroll to witness centuries of handloom craft unfold.',
    start: 0.00,
    end: 0.14,
  },
  {
    id: 'ov-sourcing',
    className: 'ov-sourcing',
    kicker: 'DIRECT SOURCING',
    headline: 'No Middlemen.<br/>No Markup.',
    body: 'We work directly with generational master weavers across Banaras, Kanchipuram, Chanderi, and Yeola — ensuring fair compensation and untouched authenticity.',
    start: 0.18,
    end: 0.32,
  },
  {
    id: 'ov-purity',
    className: 'ov-purity',
    kicker: 'PURITY CERTIFIED',
    headline: 'Every Thread<br/>Verified',
    body: 'Silk Mark authentication. 2G gold zari purity testing. Hand-inspected weave integrity — certified before it ever reaches you.',
    start: 0.36,
    end: 0.50,
  },
  {
    id: 'ov-exclusive',
    className: 'ov-exclusive',
    kicker: 'ONE OF A KIND',
    headline: 'Handwoven.<br/>Never Repeated.',
    body: 'Each saree takes hundreds of loom hours. No two are alike. What you receive is an unrepeatable heirloom — not a factory copy.',
    start: 0.54,
    end: 0.68,
  },
  {
    id: 'ov-trust',
    className: 'ov-trust',
    kicker: 'WHY TRUST US',
    headline: 'Transparent.<br/>Inspected. Insured.',
    body: 'Pre-shipment video inspection of your exact saree. White-glove packaging. Fully insured global delivery to your doorstep.',
    start: 0.72,
    end: 0.84,
  },
  {
    id: 'ov-finale',
    className: 'ov-finale',
    kicker: 'THE MASTERPIECE',
    headline: 'Curated Luxury<br/>in Every Yard',
    body: 'Experience the finest handloom sarees — brought directly from the loom into your personal wardrobe.',
    start: 0.88,
    end: 1.00,
    cta: {
      text: 'Explore Curated Sarees →',
      href: '/catalog',
    },
  },
];

export default function Overlays({ progress }: OverlaysProps) {
  return (
    <div className="overlay-layer">
      {overlays.map((ov) => {
        const isActive = progress >= ov.start && progress <= ov.end;
        return (
          <div
            key={ov.id}
            className={`ov ${ov.className} ${isActive ? 'active' : ''}`}
          >
            <span className="ov-kicker">{ov.kicker}</span>
            <h2
              className="ov-headline"
              style={{ fontFamily: 'var(--font-display)' }}
              dangerouslySetInnerHTML={{ __html: ov.headline }}
            />
            <p className="ov-body">{ov.body}</p>
            {ov.cta && (
              <a
                className="cta-btn"
                href={ov.cta.href}
                {...(ov.cta.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {ov.cta.text}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
