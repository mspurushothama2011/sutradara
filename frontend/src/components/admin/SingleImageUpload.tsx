'use client';

import React, { useState, useRef } from 'react';
import { uploadSingleImage } from '@/lib/api';

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export default function SingleImageUpload({
  value,
  onChange,
  label = 'Category Image',
  helperText = 'Upload a high-quality JPG, PNG, or WEBP image (Max 15MB).',
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, etc.).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image file size exceeds 15MB limit.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const res = await uploadSingleImage(file);
      onChange(res.url);
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Preview Card or Dropzone */}
      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            background: '#FAF8F5',
            borderRadius: '8px',
            border: '1px solid rgba(179, 137, 56, 0.3)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#EAE5DC',
              flexShrink: 0,
              border: '1px solid rgba(179, 137, 56, 0.25)',
            }}
          >
            <img
              src={value}
              alt="Category Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {value.split('/').pop()}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
              ✓ Image Uploaded &amp; Saved
            </span>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '4px 10px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(179, 137, 56, 0.4)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading...' : 'Replace Image'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#DC2626',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            border: `2px dashed ${dragOver ? 'var(--gold)' : 'rgba(179, 137, 56, 0.4)'}`,
            borderRadius: '8px',
            background: dragOver ? 'rgba(179, 137, 56, 0.08)' : '#FAF8F5',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center',
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid rgba(179, 137, 56, 0.2)',
                  borderTopColor: 'var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)' }}>
                Uploading image to server...
              </span>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                Click to upload or drag &amp; drop
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                {helperText}
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
