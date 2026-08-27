'use client';

interface PreloaderProps {
  progress: number; // 0–100
  isLoaded: boolean;
}

export default function Preloader({ progress, isLoaded }: PreloaderProps) {
  return (
    <div className={`preloader ${isLoaded ? 'hidden' : ''}`}>
      <div className="preloader-inner">
        <p className="preloader-brand" style={{ fontFamily: 'var(--font-display)' }}>
          SUTRADARA
        </p>
        <div className="preloader-bar-track">
          <div
            className="preloader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="preloader-pct">{progress}%</span>
      </div>
    </div>
  );
}
