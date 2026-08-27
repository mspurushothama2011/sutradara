'use client';

interface ScrollCueProps {
  visible: boolean;
}

export default function ScrollCue({ visible }: ScrollCueProps) {
  return (
    <div className={`scroll-cue ${visible ? '' : 'hide'}`}>
      <span>Scroll</span>
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
        <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
        <circle className="scroll-dot" cx="8" cy="7" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
