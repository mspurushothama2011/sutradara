'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BarcodeControlProps {
  value: string;
  onChange: (val: string) => void;
  craftRegion?: string;
  categoryName?: string;
  fabric?: string;
}

// Global session cache for connected barcode reader to avoid prompting every scan
let cachedReaderStatus: { connected: boolean; deviceName: string; lastChecked: number } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export default function BarcodeControl({
  value,
  onChange,
  craftRegion = 'VARANASI',
  categoryName = 'SILK',
  fabric = 'KATAN',
}: BarcodeControlProps) {
  const [readerConnected, setReaderConnected] = useState<boolean>(false);
  const [readerName, setReaderName] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [noDevicePromptOpen, setNoDevicePromptOpen] = useState<boolean>(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio confirmation chime on scan / auto-generate
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // 1046.5 Hz (High C)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext might be muted or awaiting interaction
    }
  };

  // Generate clean, standard Sutraಧಾರ SKU / Barcode
  const handleAutoGenerate = () => {
    const regCode = (craftRegion || 'SUT')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase();
    const fabCode = (fabric || categoryName || 'SLK')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase();
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const newSku = `SUT-${regCode || 'IND'}-${fabCode || 'SLK'}-${randDigits}`;
    onChange(newSku);
    setScanSuccessMessage(`Generated: ${newSku}`);
    playScanBeep();
    setTimeout(() => setScanSuccessMessage(null), 3000);
  };

  // Check for connected barcode reader once (cached for session/duration)
  const checkReaderConnection = useCallback(async (forcePrompt = false): Promise<boolean> => {
    const now = Date.now();

    // Check cached connection first (to avoid checking every single time during continuous scanning)
    if (!forcePrompt && cachedReaderStatus && now - cachedReaderStatus.lastChecked < CACHE_DURATION_MS) {
      if (cachedReaderStatus.connected) {
        setReaderConnected(true);
        setReaderName(cachedReaderStatus.deviceName);
        return true;
      }
    }

    // 1. Check via WebHID API if supported (Chrome/Edge on Windows/Mac)
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      try {
        const existingDevices = await (navigator as any).hid.getDevices();
        if (existingDevices && existingDevices.length > 0) {
          const device = existingDevices[0];
          const name = device.productName || 'USB / Wireless Barcode Reader';
          cachedReaderStatus = { connected: true, deviceName: name, lastChecked: now };
          setReaderConnected(true);
          setReaderName(name);
          return true;
        }

        // If force requested by user click and no device paired yet, request pairing
        if (forcePrompt) {
          try {
            const requested = await (navigator as any).hid.requestDevice({ filters: [] });
            if (requested && requested.length > 0) {
              const device = requested[0];
              const name = device.productName || 'USB / Wireless Barcode Reader';
              cachedReaderStatus = { connected: true, deviceName: name, lastChecked: now };
              setReaderConnected(true);
              setReaderName(name);
              return true;
            }
          } catch (reqErr: any) {
            console.log('User cancelled or no device selected in WebHID dialog');
          }
        }
      } catch (err) {
        console.warn('WebHID check error:', err);
      }
    }

    // 2. If already used in this session or hardware wedge scanner confirmed
    if (cachedReaderStatus?.connected) {
      setReaderConnected(true);
      setReaderName(cachedReaderStatus.deviceName);
      return true;
    }

    return false;
  }, []);

  // Initialize and check once on component mount
  useEffect(() => {
    checkReaderConnection(false);
  }, [checkReaderConnection]);

  // Handle "Start Barcode Scan" Button
  const handleStartScan = async () => {
    // Check if device is connected (or prompt if never checked)
    const isConnected = await checkReaderConnection(true);

    if (isConnected) {
      setIsListening(true);
      setScanSuccessMessage('Barcode Reader Ready. Pull trigger on scanner.');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      setTimeout(() => {
        setScanSuccessMessage((prev) => (prev?.includes('Ready') ? null : prev));
      }, 4000);
    } else {
      // Prompt no device found
      setNoDevicePromptOpen(true);
    }
  };

  // Hardware Barcode Scanner Keystroke Stream Interceptor
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // Barcode reader guns type characters extremely fast (< 50ms apart)
      if (timeDiff > 70) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      // Barcode scanners finish with Enter key
      if (e.key === 'Enter' && barcodeBuffer.length >= 3) {
        e.preventDefault();
        e.stopPropagation();

        const scannedCode = barcodeBuffer.trim().toUpperCase();
        onChange(scannedCode);

        // Mark reader as connected & cached upon receiving valid scan burst
        if (!readerConnected) {
          setReaderConnected(true);
          setReaderName('Hardware Barcode Reader');
          cachedReaderStatus = { connected: true, deviceName: 'Hardware Barcode Reader', lastChecked: Date.now() };
        }

        setIsListening(true);
        setScanSuccessMessage(`Scanned: ${scannedCode}`);
        playScanBeep();
        setTimeout(() => setScanSuccessMessage(null), 3500);
        barcodeBuffer = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onChange, readerConnected]);

  return (
    <div>
      {/* Header with Mode Options & Reader Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SKU / Barcode *
          </label>
          {readerConnected && (
            <span
              style={{
                fontSize: '0.68rem',
                color: '#15803d',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Reader Ready
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleAutoGenerate}
            title="Auto-generate a standardized SKU / Barcode"
            style={{
              padding: '4px 10px',
              background: 'rgba(179, 137, 56, 0.12)',
              border: '1px solid rgba(179, 137, 56, 0.35)',
              borderRadius: '4px',
              color: 'var(--gold)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Auto-Generate
          </button>

          <button
            type="button"
            onClick={handleStartScan}
            title="Check reader device and arm for continuous barcode scanning"
            style={{
              padding: '4px 10px',
              background: isListening ? 'rgba(34, 197, 94, 0.15)' : '#FAF8F5',
              border: isListening ? '1px solid #16a34a' : '1px solid rgba(179, 137, 56, 0.35)',
              borderRadius: '4px',
              color: isListening ? '#15803d' : 'var(--text)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isListening ? 'Scanning Active' : 'Scan with Reader'}
          </button>
        </div>
      </div>

      {/* Input Field with direct typing and hardware scanner support */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Scan with barcode reader or type custom SKU..."
          value={value}
          onFocus={() => setIsListening(true)}
          onBlur={() => setIsListening(false)}
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: isListening ? '#FFFDF8' : '#FAF8F5',
            border: isListening
              ? '2px solid var(--gold)'
              : scanSuccessMessage
              ? '2px solid #16a34a'
              : '1px solid rgba(179, 137, 56, 0.3)',
            borderRadius: '6px',
            color: 'var(--text)',
            fontSize: '0.88rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            outline: 'none',
            letterSpacing: '0.04em',
            transition: 'border 0.2s ease, background 0.2s ease',
            boxShadow: isListening ? '0 0 10px rgba(179, 137, 56, 0.25)' : 'none',
          }}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Real-Time Scan Feedback (only shows when scanning or active) */}
      {(scanSuccessMessage || isListening) && (
        <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>
          {scanSuccessMessage ? (
            <span style={{ color: '#15803d', fontWeight: 700 }}>
              {scanSuccessMessage}
            </span>
          ) : isListening ? (
            <span style={{ color: '#15803d', fontWeight: 600 }}>
              Reader Ready: Trigger your barcode scanner gun.
            </span>
          ) : null}
        </div>
      )}

      {/* "No Device Found" Prompt Modal */}
      {noDevicePromptOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 19, 13, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid rgba(179, 137, 56, 0.4)',
              padding: '24px 28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: '0 0 8px', fontWeight: 700, color: 'var(--text)' }}>
              No Barcode Reader Found
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5, margin: '0 0 20px' }}>
              We could not detect a connected <strong>USB or Bluetooth Barcode Reader</strong>.
              <br /><br />
              Please make sure your barcode scanner is plugged into your device and powered on. Once plugged in, you can pull the scanner trigger at any time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={async () => {
                  setNoDevicePromptOpen(false);
                  const connected = await checkReaderConnection(true);
                  if (connected) {
                    setIsListening(true);
                    setScanSuccessMessage('Barcode Reader Connected');
                  } else {
                    setNoDevicePromptOpen(true);
                  }
                }}
                style={{
                  padding: '10px 16px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Re-check for Barcode Reader
              </button>

              <button
                type="button"
                onClick={() => {
                  setNoDevicePromptOpen(false);
                  setIsListening(true);
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={{
                  padding: '8px 16px',
                  background: '#FAF8F5',
                  border: '1px solid rgba(179, 137, 56, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue (Type Manually)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
