'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, MapPin, Check, X, Sparkles } from 'lucide-react';
import { AutocompleteOption } from '@/lib/india-locations';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options?: (string | AutocompleteOption)[] | readonly string[];
  searchFn?: (query: string) => (string | AutocompleteOption)[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onSelectOption?: (option: string, rawOption?: AutocompleteOption) => void;
  helperText?: string;
  id?: string;
}

export default function AddressAutocomplete({
  label,
  value,
  onChange,
  options = [],
  searchFn,
  placeholder = 'Type to search...',
  required = false,
  disabled = false,
  onSelectOption,
  helperText,
  id,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Normalize options into AutocompleteOption format
  const normalizedOptions: AutocompleteOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return {
          value: opt,
          label: opt,
          matchTerms: [opt],
        };
      }
      return opt;
    });
  }, [options]);

  // Compute filtered options
  const filteredOptions: AutocompleteOption[] = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (searchFn) {
      const results = searchFn(value);
      return results.map((opt) => {
        if (typeof opt === 'string') {
          return { value: opt, label: opt, matchTerms: [opt] };
        }
        return opt;
      });
    }

    if (!query) {
      return normalizedOptions.slice(0, 40);
    }

    const startsWith: AutocompleteOption[] = [];
    const contains: AutocompleteOption[] = [];

    for (const opt of normalizedOptions) {
      const labelLower = opt.label.toLowerCase();
      const matchTerms = opt.matchTerms || [opt.label, opt.value];
      const matchLower = matchTerms.map((t) => t.toLowerCase());

      const isExactStart = labelLower.startsWith(query) || matchLower.some((t) => t.startsWith(query));
      const isContained = labelLower.includes(query) || matchLower.some((t) => t.includes(query));

      if (isExactStart) {
        startsWith.push(opt);
      } else if (isContained) {
        contains.push(opt);
      }
    }

    return [...startsWith, ...contains].slice(0, 35);
  }, [normalizedOptions, searchFn, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        selectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const selectOption = (opt: AutocompleteOption) => {
    onChange(opt.value);
    if (onSelectOption) {
      onSelectOption(opt.value, opt);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Label */}
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.72rem',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '4px',
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>

      {/* Input Box with Custom Icon & Chevron Button */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#FAF8F5',
          border: isOpen ? '1px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.3)',
          borderRadius: '6px',
          boxShadow: isOpen ? '0 0 0 3px rgba(179, 137, 56, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />

        {/* Action Controls: Clear button + Custom Luxury Chevron Toggle */}
        <div
          style={{
            position: 'absolute',
            right: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {value && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              tabIndex={-1}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'color 0.15s ease',
              }}
              title="Clear"
            >
              <X size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={toggleDropdown}
            tabIndex={-1}
            disabled={disabled}
            style={{
              background: isOpen ? 'rgba(179, 137, 56, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: isOpen ? 'var(--gold)' : 'var(--text-dim)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={isOpen ? 'Close suggestions' : 'Open suggestions'}
          >
            <ChevronDown
              size={15}
              strokeWidth={2}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Floating Animated Luxury Dropdown Menu */}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.35)',
            borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(26, 19, 13, 0.12), 0 2px 8px rgba(179, 137, 56, 0.08)',
            maxHeight: '230px',
            overflowY: 'auto',
            margin: 0,
            padding: '6px',
            listStyle: 'none',
          }}
        >
          {filteredOptions.map((opt, idx) => {
            const isSelected = opt.value.toLowerCase() === value.trim().toLowerCase();
            const isHighlighted = idx === highlightedIndex;

            // Highlight matched characters in gold
            const query = value.trim().toLowerCase();
            const matchIndex = query ? opt.label.toLowerCase().indexOf(query) : -1;

            return (
              <li
                key={`${opt.value}-${opt.state || ''}-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before select
                  selectOption(opt);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  color: isSelected ? 'var(--gold)' : 'var(--text)',
                  fontWeight: isSelected ? 700 : 500,
                  background: isHighlighted
                    ? 'rgba(179, 137, 56, 0.12)'
                    : isSelected
                    ? 'rgba(179, 137, 56, 0.06)'
                    : 'transparent',
                  transition: 'background 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <MapPin size={13} color="var(--gold)" style={{ opacity: 0.7, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {matchIndex >= 0 ? (
                        <>
                          {opt.label.substring(0, matchIndex)}
                          <strong style={{ color: 'var(--gold-dark, #8A6418)', textDecoration: 'underline' }}>
                            {opt.label.substring(matchIndex, matchIndex + query.length)}
                          </strong>
                          {opt.label.substring(matchIndex + query.length)}
                        </>
                      ) : (
                        opt.label
                      )}
                    </span>
                    {opt.subtitle && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: isHighlighted ? 'var(--gold-dark, #8A6418)' : 'var(--text-dim)',
                          marginTop: '1px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {opt.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check size={14} color="var(--gold)" strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: '8px' }} />}
              </li>
            );
          })}
        </ul>
      )}

      {/* When no match found */}
      {isOpen && value.trim() && filteredOptions.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(26, 19, 13, 0.08)',
          }}
        >
          No matching standard location. Your custom entry <strong style={{ color: 'var(--text)' }}>"{value}"</strong> will be used.
        </div>
      )}

      {helperText && (
        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '3px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
