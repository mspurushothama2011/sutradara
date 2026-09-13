'use client';

import React, { useState, useRef } from 'react';
import { uploadMultipleImages } from '@/lib/api';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
  maxFiles?: number;
}

export default function MultiImageUpload({
  value = [],
  onChange,
  label = 'Product Saree Photos',
  helperText = 'Upload multiple high-resolution photos (Max 10 photos, 15MB each). First image is the Primary Cover.',
  maxFiles = 10,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (value.length + fileArray.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} images per saree.`);
      return;
    }

    const invalidType = fileArray.some((f) => !f.type.startsWith('image/'));
    if (invalidType) {
      setError('Please select only valid image files (JPG, PNG, WEBP, etc.).');
      return;
    }

    const oversized = fileArray.some((f) => f.size > 15 * 1024 * 1024);
    if (oversized) {
      setError('One or more images exceed the 15MB size limit.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const res = await uploadMultipleImages(fileArray);
      if (res.urls && res.urls.length > 0) {
        onChange([...value, ...res.urls]);
      }
    } catch (err: any) {
      console.error('Failed to upload images:', err);
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const target = value[index];
    const remaining = value.filter((_, idx) => idx !== index);
    onChange([target, ...remaining]);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const copy = [...value];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    onChange(copy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label} * ({value.length}/{maxFiles})
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear All Photos
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
      />

      {/* Gallery Grid of Uploaded Images */}
      {value.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '4px',
          }}
        >
          {value.map((imgUrl, index) => {
            const isCover = index === 0;
            return (
              <div
                key={`${imgUrl}-${index}`}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  border: isCover
                    ? '2px solid var(--gold)'
                    : '1px solid rgba(179, 137, 56, 0.25)',
                  background: '#FAF8F5',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isCover ? '0 4px 12px rgba(179, 137, 56, 0.2)' : 'none',
                }}
              >
                {/* Image Container */}
                <div style={{ position: 'relative', width: '100%', height: '110px', background: '#EAE5DC' }}>
                  <img
                    src={imgUrl}
                    alt={`Saree photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isCover ? 'var(--gold)' : 'rgba(26, 19, 13, 0.75)',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {isCover ? 'Cover' : `#${index + 1}`}
                  </span>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    title="Remove this photo"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'rgba(220, 38, 38, 0.9)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Control Actions Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 6px',
                    background: '#FFFFFF',
                    borderTop: '1px solid rgba(179, 137, 56, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, index - 1)}
                      title="Move left"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        opacity: index === 0 ? 0.3 : 1,
                        fontSize: '0.75rem',
                        padding: '2px 4px',
                      }}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      disabled={index === value.length - 1}
                      onClick={() => moveItem(index, index + 1)}
                      title="Move right"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: index === value.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: index === value.length - 1 ? 0.3 : 1,
                        fontSize: '0.75rem',
                        padding: '2px 4px',
                      }}
                    >
                      ▶
                    </button>
                  </div>

                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      Set Cover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-file Dropzone & Add Button */}
      {value.length < maxFiles && (
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
            padding: value.length === 0 ? '24px 16px' : '14px 16px',
            border: `2px dashed ${dragOver ? 'var(--gold)' : 'rgba(179, 137, 56, 0.35)'}`,
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
                  width: '26px',
                  height: '26px',
                  border: '3px solid rgba(179, 137, 56, 0.2)',
                  borderTopColor: 'var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)' }}>
                Uploading saree photos to server...
              </span>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)' }}>
                {value.length === 0
                  ? 'Click to upload or drag & drop saree photos'
                  : '+ Add more photos to gallery'}
              </span>
              {value.length === 0 && (
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {helperText}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
